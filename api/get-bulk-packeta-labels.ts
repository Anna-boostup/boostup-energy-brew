import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PDFDocument } from 'pdf-lib';

const PACKETA_API_URL = 'https://www.zasilkovna.cz/api/rest';

async function fetchIndividualLabel(packetId: string, apiPassword: string): Promise<Buffer> {
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<packetLabelPdf>
  <apiPassword>${apiPassword}</apiPassword>
  <packetId>${packetId}</packetId>
  <offset>0</offset>
  <format>A6 on A4</format>
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

    if (text.includes('<status>error</status>') || text.includes('<faultCode>')) {
        const faultMatch = text.match(/<string>([^<]+)<\/string>/) || text.match(/<faultstring>([^<]+)<\/faultstring>/);
        throw new Error(faultMatch ? faultMatch[1] : `Zásilkovna error for ${packetId}`);
    }

    const tags = ['response', 'labelContents', 'result', 'content', 'packetLabelPdfResult'];
    for (const tag of tags) {
        const regex = new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`);
        const match = text.match(regex);
        if (match && match[1].trim().length > 100) {
            return Buffer.from(match[1].trim().replace(/[\s\r\n]/g, ''), 'base64');
        }
    }

    // Newline-aware greedy fallback
    const greedyMatch = text.match(/>([\s\r\n]*[A-Za-z0-9+/=]{100,})</);
    if (greedyMatch) {
        return Buffer.from(greedyMatch[1].replace(/[\s\r\n]/g, ''), 'base64');
    }

    throw new Error(`Failed to extract PDF for packet ${packetId}`);
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
        console.log(`Starting bulk merge for ${packetIds.length} labels...`);

        // Fetch all labels in parallel
        const labelBuffers = await Promise.all(
            packetIds.map(id => fetchIndividualLabel(id.trim(), apiPassword))
        );

        // Merge PDFs
        const mergedPdf = await PDFDocument.create();

        for (const buffer of labelBuffers) {
            const pdf = await PDFDocument.load(buffer);
            const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
            copiedPages.forEach((page) => mergedPdf.addPage(page));
        }

        const mergedPdfBytes = await mergedPdf.save();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename="packeta-merged-labels.pdf"');
        return res.send(Buffer.from(mergedPdfBytes));

    } catch (error: any) {
        console.error('Error in bulk label merging:', error);
        return res.status(500).json({ error: error.message || 'Failed to merge labels' });
    }
}
