import type { VercelRequest, VercelResponse } from '@vercel/node';

const PACKETA_API_URL = 'https://www.zasilkovna.cz/api/rest';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // ids can be passed as a comma-separated string or array
    const { ids, format = 'A6 on A4' } = req.query;

    if (!ids) {
        return res.status(400).json({ error: 'Missing ids parameter' });
    }

    const apiPassword = process.env.PACKETA_API_PASSWORD;
    if (!apiPassword) {
        console.error('PACKETA_API_PASSWORD not set in environment');
        return res.status(500).json({ error: 'Server configuration error' });
    }

    const idList = String(ids).split(',').map(id => id.trim().replace(/[^a-zA-Z0-9-]/g, ''));

    if (idList.length === 0) {
        return res.status(400).json({ error: 'No valid IDs provided' });
    }

    // Use the Packeta REST XML API to fetch multiple labels as a single PDF
    // Method: packetsLabelsPdf
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<packetsLabelsPdf>
  <apiPassword>${apiPassword}</apiPassword>
  <packetIds>
    ${idList.map(id => `<packetId>${id}</packetId>`).join('\n    ')}
  </packetIds>
  <format>${format}</format>
  <offset>0</offset>
</packetsLabelsPdf>`;

    try {
        console.log(`Fetching bulk Packeta labels for ${idList.length} packets...`);

        const response = await fetch(PACKETA_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/xml; charset=utf-8',
                'Accept-Language': 'cs-CZ'
            },
            body: xml
        });

        const text = await response.text();
        console.log('--- PACKETA BULK RESPONSE START ---');
        console.log(text.substring(0, 500));
        console.log('--- PACKETA BULK RESPONSE END ---');

        // Check for API fault
        if (text.includes('<status>error</status>') || text.includes('<faultCode>')) {
            const faultMatch = text.match(/<string>([^<]+)<\/string>/) || text.match(/<faultstring>([^<]+)<\/faultstring>/);
            const errorMsg = faultMatch ? faultMatch[1] : 'Neznámá chyba Zásilkovny';
            console.error('Packeta bulk labels API error:', errorMsg);
            return res.status(400).json({ error: `Packeta: ${errorMsg}` });
        }

        // Extract base64 PDF from response - robust parsing matching single label API
        let pdfBase64 = '';
        const pdfMatch = text.match(/<response>([^<]+)<\/response>/) ||
            text.match(/<labelContents>([^<]+)<\/labelContents>/) ||
            text.match(/<result>([^<]+)<\/result>/) ||
            text.match(/<content>([^<]+)<\/content>/);

        if (pdfMatch && pdfMatch[1]) {
            pdfBase64 = pdfMatch[1].trim();
        } else {
            // "Greedy" fallback: find any long continuous string that looks like base64
            // (Looking for a sequence of 1000+ base64 chars between tags)
            const greedyMatch = text.match(/>([A-Za-z0-9+/=]{1000,})</);
            if (greedyMatch) {
                console.log('Using greedy PDF extraction fallback');
                pdfBase64 = greedyMatch[1].trim();
            }
        }

        if (!pdfBase64) {
            console.error('No PDF content in Packeta bulk response. Response length:', text.length);
            return res.status(500).json({ error: 'Failed to extract PDF from Packeta response' });
        }

        const pdfBuffer = Buffer.from(pdfBase64, 'base64');
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename="packeta-labels.pdf"');
        return res.send(pdfBuffer);

    } catch (error: any) {
        console.error('Error fetching bulk Packeta labels:', error);
        return res.status(500).json({ error: `Internal server error: ${error.message}` });
    }
}
