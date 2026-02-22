import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const { barcode } = req.query;

    if (!barcode) {
        return res.status(400).json({ error: 'Missing barcode parameter' });
    }

    const apiPassword = process.env.PACKETA_API_PASSWORD;
    if (!apiPassword) {
        console.error('PACKETA_API_PASSWORD not set in environment');
        return res.status(500).json({ error: 'Server configuration error' });
    }

    // Sanitize barcode to prevent path traversal or other injection
    const sanitizedBarcode = String(barcode).replace(/[^a-zA-Z0-9-]/g, '');

    // Construct the actual Zasilkovna API URL
    const packetaUrl = `https://www.zasilkovna.cz/api/v4/${apiPassword}/packets/${sanitizedBarcode}.pdf`;

    try {
        const response = await fetch(packetaUrl);

        if (!response.ok) {
            console.error(`Packeta API returned ${response.status} for barcode ${sanitizedBarcode}`);
            return res.status(response.status).json({ error: 'Failed to fetch label from Packeta' });
        }

        const data = await response.arrayBuffer();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="label-${sanitizedBarcode}.pdf"`);
        return res.send(Buffer.from(data));

    } catch (error) {
        console.error('Error proxying Packeta label:', error);
        return res.status(500).json({ error: 'Internal server error while fetching label' });
    }
}
