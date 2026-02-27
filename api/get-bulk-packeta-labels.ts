import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PDFDocument } from 'pdf-lib';

const PACKETA_API_URL = 'https://www.zasilkovna.cz/api/rest';

async function fetchIndividualLabel(packetId: string, apiPassword: string): Promise<Buffer> {
    // Standardizing on '105x148mm' as it proved most stable
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<packetLabelPdf>
  <apiPassword>${apiPassword}</apiPassword>
  <packetId>${packetId}</packetId>
  <offset>0</offset>
  <format>105x148mm</format>
</packetLabelPdf>`;

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
        throw new Error(`Zásilkovna (${packetId}): ${errorMsg}`);
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

    // Newline-aware greedy fallback
    if (!pdfBase64) {
        const greedyMatch = text.match(/>([\s\r\n]*[A-Za-z0-9+/=]{100,})</);
        if (greedyMatch) {
            pdfBase64 = greedyMatch[1].replace(/[\s\r\n]/g, '');
        }
    }

    if (!pdfBase64) {
        console.error(`Failed to extract base64 from response for ${packetId}. Response summary:`, text.substring(0, 500));
        throw new Error(`Nepodařilo se najít PDF data pro zásilku ${packetId}`);
    }

    const pdfBuffer = Buffer.from(pdfBase64, 'base64');

    // STRICT VERIFICATION: Check for %PDF- header
    const header = pdfBuffer.slice(0, 5).toString();
    if (header !== '%PDF-') {
        console.error(`Invalid PDF header for ${packetId}: "${header}". First 100 bytes of data:`, pdfBuffer.slice(0, 100).toString('hex'));
        throw new Error(`Zásilkovna vrátila pro ${packetId} neplatný formát (chybí PDF hlavička).`);
    }

    return pdfBuffer;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const { ids } = req.query;

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
        console.log(`Starting bulk merge v5 for ${packetIds.length} labels...`);

        // Fetch all labels in parallel
        const labelBuffers = await Promise.all(
            packetIds.map(id => fetchIndividualLabel(id.trim(), apiPassword))
        );

        // Merge PDFs
        const mergedPdf = await PDFDocument.create();

        for (let i = 0; i < labelBuffers.length; i++) {
            try {
                const pdf = await PDFDocument.load(labelBuffers[i]);
                const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
                copiedPages.forEach((page) => mergedPdf.addPage(page));
            } catch (loadErr) {
                console.error(`PDFDocument.load failed for buffer ${i} (ID: ${packetIds[i]}):`, loadErr);
                throw new Error(`Chyba při zpracování PDF pro zásilku ${packetIds[i]}`);
            }
        }

        const mergedPdfBytes = await mergedPdf.save();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename="packeta-merged-labels.pdf"');
        return res.send(Buffer.from(mergedPdfBytes));

    } catch (error: any) {
        console.error('Error in bulk label merging v5:', error);
        return res.status(500).json({ error: error.message || 'Failed to merge labels' });
    }
}
