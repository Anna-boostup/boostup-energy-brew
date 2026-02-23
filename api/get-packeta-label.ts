import type { VercelRequest, VercelResponse } from '@vercel/node';

const PACKETA_API_URL = 'https://www.zasilkovna.cz/api/rest';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const { packetId, barcode } = req.query;

    // Accept either packetId or barcode as identifier
    const id = packetId || barcode;

    if (!id) {
        return res.status(400).json({ error: 'Missing packetId or barcode parameter' });
    }

    const apiPassword = process.env.PACKETA_API_PASSWORD;
    if (!apiPassword) {
        console.error('PACKETA_API_PASSWORD not set in environment');
        return res.status(500).json({ error: 'Server configuration error' });
    }

    const sanitizedId = String(id).replace(/[^a-zA-Z0-9-]/g, '');

    // Use the Packeta REST XML API to fetch label as PDF
    // Method: packetLabelPdf — returns a base64-encoded PDF
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<packetLabelPdf>
  <apiPassword>${apiPassword}</apiPassword>
  <packetId>${sanitizedId}</packetId>
  <offset>0</offset>
  <format>A6 on A4</format>
</packetLabelPdf>`;

    try {
        console.log(`Fetching Packeta label for packet/barcode: ${sanitizedId}`);

        const response = await fetch(PACKETA_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/xml; charset=utf-8',
                'Accept-Language': 'cs-CZ'
            },
            body: xml
        });

        const text = await response.text();
        console.log('Packeta label API response:', text.substring(0, 500));

        // Check for API fault
        if (text.includes('<status>error</status>') || text.includes('<faultCode>')) {
            const faultMatch = text.match(/<string>([^<]+)<\/string>/);
            const errorMsg = faultMatch ? faultMatch[1] : 'Neznámá chyba Zásilkovny';
            console.error('Packeta label API error:', errorMsg);
            return res.status(400).json({ error: `Packeta: ${errorMsg}` });
        }

        // Extract base64 PDF from response
        const pdfMatch = text.match(/<response>([^<]+)<\/response>/);
        if (!pdfMatch || !pdfMatch[1]) {
            // Try alternative response tag
            const labelMatch = text.match(/<labelContents>([^<]+)<\/labelContents>/);
            if (!labelMatch || !labelMatch[1]) {
                console.error('No PDF content in Packeta response:', text.substring(0, 1000));
                return res.status(500).json({ error: 'Failed to extract PDF from Packeta response' });
            }
            const pdfBuffer = Buffer.from(labelMatch[1], 'base64');
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `inline; filename="label-${sanitizedId}.pdf"`);
            return res.send(pdfBuffer);
        }

        const pdfBuffer = Buffer.from(pdfMatch[1], 'base64');
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="label-${sanitizedId}.pdf"`);
        return res.send(pdfBuffer);

    } catch (error: any) {
        console.error('Error fetching Packeta label:', error);
        return res.status(500).json({ error: `Internal server error: ${error.message}` });
    }
}
