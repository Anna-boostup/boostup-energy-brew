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

    const safeFirstName = firstName?.trim() || 'Zakaznik';
    const safeLastName = lastName?.trim() || 'Prijmeni'; // lastName is mandatory
    const safePhone = (phone || '').replace(/\s/g, '');

    if (!orderNumber || !email || !safePhone || !packetaPointId) {
        return res.status(400).json({ error: 'Chybí povinné údaje pro Zásilkovnu (ID bodu, email nebo telefon)' });
    }

    const xml = `<?xml version="1.0" encoding="utf-8"?>
<createPacket>
  <apiPassword>${apiPassword}</apiPassword>
  <packetAttributes>
    <number>${orderNumber}</number>
    <name>${safeFirstName}</name>
    <surname>${safeLastName}</surname>
    <email>${email}</email>
    <phone>${safePhone}</phone>
    <addressId>${packetaPointId}</addressId>
    <currency>CZK</currency>
    <cod>${cod}</cod>
    <value>${Math.round(total)}</value>
    <weight>${weight}</weight>
    <eshop>drinkboostup</eshop>
    <adultContent>0</adultContent>
  </packetAttributes>
</createPacket>`;

    try {
        console.log(`Creating Packeta packet for order ${orderNumber}...`);

        const response = await fetch(PACKETA_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/xml; charset=utf-8',
                'Accept-Language': 'cs-CZ',
                'Content-Language': 'cs-CZ'
            },
            body: xml
        });

        const text = await response.text();

        // Detailed error parsing
        const faultMatch = text.match(/<fault>([^<]+)<\/fault>/);
        const faultStringMatch = text.match(/<string>([^<]+)<\/string>/);
        const detailMatch = text.match(/<detail>([^<]+)<\/detail>/);

        if (faultMatch) {
            const errorMsg = faultStringMatch ? faultStringMatch[1] : faultMatch[1];
            const detailMsg = detailMatch ? ` (${detailMatch[1]})` : '';
            console.error('Packeta API Fault:', errorMsg, detailMsg);
            return res.status(400).json({ error: `Packeta chyba: ${errorMsg}${detailMsg}` });
        }

        const barcodeMatch = text.match(/<barcode>([^<]+)<\/barcode>/);
        const idMatch = text.match(/<id>([^<]+)<\/id>/);

        if (!barcodeMatch || !idMatch) {
            console.error('Unexpected Packeta raw response:', text);
            return res.status(500).json({ error: 'Chyba při parsování odpovědi ze Zásilkovny. Zkontrolujte logy.' });
        }

        const barcode = barcodeMatch[1];
        const packetId = idMatch[1];

        return res.status(200).json({ success: true, barcode, packetId });

    } catch (err: any) {
        console.error('Packeta API connection error:', err);
        return res.status(500).json({ error: `Chyba spojení se Zásilkovnou: ${err.message}` });
    }
}
