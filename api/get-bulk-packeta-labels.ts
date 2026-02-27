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
        console.log('--- PACKETA BULK RESPONSE START (first 1000 chars) ---');
        console.log(text.substring(0, 1000));
        console.log('--- PACKETA BULK RESPONSE END ---');

        // Check for API fault
        if (text.includes('<status>error</status>') || text.includes('<faultCode>') || text.includes('<faultstring>')) {
            const faultMatch = text.match(/<string>([^<]+)<\/string>/) ||
                text.match(/<faultstring>([^<]+)<\/faultstring>/) ||
                text.match(/<detail>([^<]+)<\/detail>/);
            const errorMsg = faultMatch ? faultMatch[1] : 'Neznámá chyba Zásilkovny';
            console.error('Packeta bulk labels API error:', errorMsg);
            return res.status(400).json({ error: `Packeta: ${errorMsg}` });
        }

        // Exhaustive base64 PDF extraction
        let pdfBase64 = '';

        // Try known tags (including potential SOAP/REST variants)
        const tags = ['response', 'labelContents', 'result', 'content', 'packetLabelsPdfResult'];
        for (const tag of tags) {
            const regex = new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`);
            const match = text.match(regex);
            if (match && match[1].trim().length > 100) { // Simple heuristic for a base64 PDF
                pdfBase64 = match[1].trim();
                console.log(`Extracted PDF from <${tag}> tag`);
                break;
            }
        }

        if (!pdfBase64) {
            // "Greedy" fallback: find any long continuous (or newline-separated) string that looks like base64
            // We look for characters A-Z, a-z, 0-9, +, /, = and whitespace
            const greedyMatch = text.match(/>([\s\r\n]*[A-Za-z0-9+/=[\s\r\n]{1000,})</);
            if (greedyMatch) {
                console.log('Using newline-aware greedy PDF extraction fallback');
                pdfBase64 = greedyMatch[1].replace(/[\s\r\n]/g, ''); // Remove all whitespace
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
