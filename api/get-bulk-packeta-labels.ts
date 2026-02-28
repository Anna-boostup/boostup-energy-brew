import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PDFDocument } from 'pdf-lib';

const PACKETA_API_URL = 'https://www.zasilkovna.cz/api/rest';

async function fetchIndividualLabel(packetId: string, apiPassword: string): Promise<Buffer | null> {
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<packetLabelPdf>
  <apiPassword>${apiPassword}</apiPassword>
  <packetId>${packetId}</packetId>
  <offset>0</offset>
  <format>105x148mm</format>
</packetLabelPdf>`;

    try {
        const response = await fetch(PACKETA_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/xml; charset=utf-8',
                'Accept-Language': 'cs-CZ'
            },
            body: xml
        });

        const text = await response.text();

        if (text.includes('<status>error</status>') || text.includes('<faultCode>') || text.includes('<faultstring>')) {
            const faultMatch = text.match(/<string>([^<]+)<\/string>/) ||
                text.match(/<faultstring>([^<]+)<\/faultstring>/) ||
                text.match(/<detail>([^<]+)<\/detail>/);
            const errorMsg = faultMatch ? faultMatch[1] : 'Neznámá chyba Zásilkovny';
            console.error(`Packeta error for packet ${packetId}:`, errorMsg);
            return null;
        }

        let pdfBase64 = '';
        const tags = ['response', 'labelContents', 'result', 'content', 'packetLabelPdfResult'];
        for (const tag of tags) {
            const regex = new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`);
            const match = text.match(regex);
            if (match && match[1].trim().length > 100) {
                pdfBase64 = match[1].trim().replace(/[\s\r\n]/g, '');
                break;
            }
        }

        if (!pdfBase64) {
            const greedyMatch = text.match(/>([\s\r\n]*[A-Za-z0-9+/=]{100,})</);
            if (greedyMatch) {
                pdfBase64 = greedyMatch[1].replace(/[\s\r\n]/g, '');
            }
        }

        if (!pdfBase64) {
            console.error(`Failed to extract base64 for ${packetId}.`);
            return null;
        }

        const pdfBuffer = Buffer.from(pdfBase64, 'base64');
        const header = pdfBuffer.slice(0, 5).toString();
        if (header !== '%PDF-') {
            console.error(`Invalid PDF header for ${packetId}: "${header}"`);
            return null;
        }

        return pdfBuffer;
    } catch (e) {
        console.error(`Network or parsing error for ${packetId}:`, e);
        return null;
    }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const { ids, format } = req.query;

    if (!ids || typeof ids !== 'string') {
        return res.status(400).json({ error: 'Missing or invalid ids parameter' });
    }

    const apiPassword = process.env.PACKETA_API_PASSWORD;
    if (!apiPassword) {
        return res.status(500).json({ error: 'Server configuration error' });
    }

    const packetIds = ids.split(',').filter(id => id.trim().length > 0);
    if (packetIds.length === 0) {
        return res.status(400).json({ error: 'No valid packet IDs provided' });
    }

    try {
        console.log(`Starting resilient bulk merge for ${packetIds.length} labels (${format || 'sequential'})...`);

        // Fetch all labels in parallel
        const results = await Promise.all(
            packetIds.map(async id => {
                const buffer = await fetchIndividualLabel(id.trim(), apiPassword);
                return { id: id.trim(), buffer };
            })
        );

        const validResults = results.filter(r => r.buffer !== null);
        const skippedIds = results.filter(r => r.buffer === null).map(r => r.id);

        if (validResults.length === 0) {
            return res.status(500).json({ error: 'Nepodařilo se stáhnout ani jeden platný štítek. Zkontrolujte ID zásilek.' });
        }

        const mergedPdf = await PDFDocument.create();

        if (format === 'A6 on A4') {
            // 2x2 Grid on A4
            // A4 dimensions: 595.28 x 841.89 points
            const A4_WIDTH = 595.28;
            const A4_HEIGHT = 841.89;
            const LABEL_WIDTH = A4_WIDTH / 2;
            const LABEL_HEIGHT = A4_HEIGHT / 2;

            let currentPage = mergedPdf.addPage([A4_WIDTH, A4_HEIGHT]);
            let labelIndex = 0;

            for (const item of validResults) {
                if (labelIndex > 0 && labelIndex % 4 === 0) {
                    currentPage = mergedPdf.addPage([A4_WIDTH, A4_HEIGHT]);
                }

                const pdf = await PDFDocument.load(item.buffer!);
                const [embeddedPage] = await mergedPdf.embedPages([pdf.getPages()[0]]);

                // Position in 2x2 grid (Y is from bottom)
                const col = labelIndex % 2; // 0 or 1
                const row = Math.floor((labelIndex % 4) / 2); // 0 (top) or 1 (bottom)

                const x = col * LABEL_WIDTH;
                const y = (1 - row) * LABEL_HEIGHT; // row 0 -> top (y=420), row 1 -> bottom (y=0)

                currentPage.drawPage(embeddedPage, {
                    x,
                    y,
                    width: LABEL_WIDTH,
                    height: LABEL_HEIGHT,
                });

                labelIndex++;
            }
        } else {
            // Sequential A6 pages
            for (const item of validResults) {
                try {
                    const pdf = await PDFDocument.load(item.buffer!);
                    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
                    copiedPages.forEach((page) => mergedPdf.addPage(page));
                } catch (loadErr) {
                    console.error(`PDFDocument.load failed for packet ${item.id}:`, loadErr);
                }
            }
        }

        // Add summary page if any labels were skipped
        if (skippedIds.length > 0) {
            const summaryPage = mergedPdf.addPage([595.28, 841.89]);
            const { fontBold, fontRegular } = { fontBold: await mergedPdf.embedFont('Helvetica-Bold'), fontRegular: await mergedPdf.embedFont('Helvetica') };

            summaryPage.drawText('CHYBA: Některé štítky nebylo možné stáhnout', {
                x: 50,
                y: 780,
                size: 20,
                font: fontBold,
                color: { type: 'RGB', red: 0.8, green: 0, blue: 0 } as any
            });

            summaryPage.drawText('Následující ID zásilek nebyla společností Zásilkovna nalezena nebo vrátila neplatný formát:', {
                x: 50,
                y: 740,
                size: 12,
                font: fontRegular
            });

            let yOffset = 710;
            for (const id of skippedIds) {
                summaryPage.drawText(`- ${id}`, {
                    x: 70,
                    y: yOffset,
                    size: 11,
                    font: fontRegular
                });
                yOffset -= 20;
                if (yOffset < 50) break; // Don't overflow page
            }

            summaryPage.drawText('Vytiskněte tyto štítky prosím ručně z detailu objednávky.', {
                x: 50,
                y: yOffset - 20,
                size: 10,
                font: fontRegular,
                color: { type: 'RGB', red: 0.4, green: 0.4, blue: 0.4 } as any
            });
        }

        const mergedPdfBytes = await mergedPdf.save();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename="packeta-labels.pdf"');

        return res.send(Buffer.from(mergedPdfBytes));

    } catch (error: any) {
        console.error('Fatal error in bulk label merging:', error);
        return res.status(500).json({ error: error.message || 'Failed to merge labels' });
    }
}
