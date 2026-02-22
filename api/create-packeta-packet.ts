import type { VercelRequest, VercelResponse } from '@vercel/node';

const PACKETA_API_URL = 'https://www.zasilkovna.cz/api/rest';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const apiPassword = process.env.PACKETA_API_PASSWORD;
    if (!apiPassword) {
        return res.status(500).json({ error: 'PACKETA_API_PASSWORD not set' });
    }

    const {
        orderNumber,
        firstName,
        lastName,
        email,
        phone,
        packetaPointId,
        total,
        weight = 0.3,
        cod = 0
    } = req.body;

    if (!orderNumber || !firstName || !lastName || !email || !phone || !packetaPointId) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const xml = `<?xml version="1.0" encoding="utf-8"?>
<createPacket>
  <apiPassword>${apiPassword}</apiPassword>
  <packetAttributes>
    <number>${orderNumber}</number>
    <name>${firstName}</name>
    <surname>${lastName}</surname>
    <email>${email}</email>
    <phone>${phone.replace(/\s/g, '')}</phone>
    <addressId>${packetaPointId}</addressId>
    <cod>${cod}</cod>
    <value>${Math.round(total)}</value>
    <weight>${weight}</weight>
    <currency>CZK</currency>
    <eshop>drinkboostup</eshop>
  </packetAttributes>
</createPacket>`;

    try {
        const response = await fetch(PACKETA_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/xml; charset=utf-8' },
            body: xml
        });

        const text = await response.text();
        console.log('Packeta API response:', text);

        // Parse barcode and id from XML response
        const barcodeMatch = text.match(/<barcode>([^<]+)<\/barcode>/);
        const idMatch = text.match(/<id>([^<]+)<\/id>/);
        const faultMatch = text.match(/<fault>([^<]+)<\/fault>/);
        const faultStringMatch = text.match(/<string>([^<]+)<\/string>/);

        if (faultMatch) {
            const errorMsg = faultStringMatch ? faultStringMatch[1] : faultMatch[1];
            console.error('Packeta fault:', errorMsg);
            return res.status(400).json({ error: `Packeta chyba: ${errorMsg}` });
        }

        if (!barcodeMatch || !idMatch) {
            console.error('Could not parse Packeta response:', text);
            return res.status(500).json({ error: 'Neočekávaná odpověď z Packeta API' });
        }

        const barcode = barcodeMatch[1];
        const packetId = idMatch[1];

        return res.status(200).json({ success: true, barcode, packetId });

    } catch (err) {
        console.error('Packeta API error:', err);
        return res.status(500).json({ error: 'Chyba při komunikaci s Packeta API' });
    }
}
