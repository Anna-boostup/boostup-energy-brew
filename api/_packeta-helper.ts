export async function createPacketaPacket(orderData: {
    orderNumber: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    packetaPointId: string;
    total: number;
    weight?: number;
    cod?: number;
}) {
    const apiPassword = process.env.PACKETA_API_PASSWORD;
    if (!apiPassword) {
        throw new Error('PACKETA_API_PASSWORD not set');
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
    } = orderData;

    const safeFirstName = firstName?.trim() || 'Zakaznik';
    const safeLastName = lastName?.trim() || 'Prijmeni';
    const safePhone = (phone || '').replace(/\s/g, '');

    if (!orderNumber || !email || !safePhone || !packetaPointId) {
        throw new Error('Chybí povinné údaje pro Zásilkovnu (ID bodu, email nebo telefon)');
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
    <eshop>SKL1</eshop>
    <senderAddressId>546263</senderAddressId>
    <adultContent>0</adultContent>
  </packetAttributes>
</createPacket>`;

    console.log(`Creating Packeta packet for order ${orderNumber}...`);

    const response = await fetch('https://www.zasilkovna.cz/api/rest', {
        method: 'POST',
        headers: {
            'Content-Type': 'text/xml; charset=utf-8',
            'Accept-Language': 'cs-CZ'
        },
        body: xml
    });

    const text = await response.text();

    if (!text.includes('<status>ok</status>') && !text.includes('<barcode>')) {
        const faultStringMatch = text.match(/<string>([^<]+)<\/string>/);
        const innerFaultMatch = text.match(/<detail>.*?<fault>([^<]+)<\/fault>/s);

        let cleanError = '';
        if (innerFaultMatch) {
            cleanError = innerFaultMatch[1].replace(/Č\. ob\. [^:]+: /, '');
        } else if (faultStringMatch) {
            cleanError = faultStringMatch[1];
        } else {
            cleanError = 'Chyba validace zásilky.';
        }

        throw new Error(`Packeta: ${cleanError}`);
    }

    const barcodeMatch = text.match(/<barcode>([^<]+)<\/barcode>/);
    const idMatch = text.match(/<id>([^<]+)<\/id>/);

    const barcode = barcodeMatch ? barcodeMatch[1] : null;
    const packetId = idMatch ? idMatch[1] : null;

    if (!barcode || !packetId) {
        throw new Error('Chyba parsování odpovědi ze Zásilkovny.');
    }

    return { barcode, packetId };
}
