import { PDFDocument, StandardFonts } from 'pdf-lib';

// Sdílené generování PDF faktury (daňový doklad). Používá ho zabezpečený endpoint
// /api/generate-invoice (a později odeslání faktury e-mailem po zaplacení).
export async function buildInvoicePdf(order: any): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    let y = 800;
    page.drawText('FAKTURA - DANOVY DOKLAD', { x: 50, y, size: 20, font: boldFont });
    y -= 30;
    page.drawText(`Cislo dokladu: ${order.id}`, { x: 50, y, size: 12, font });
    y -= 40;

    page.drawText('Dodavatel:', { x: 50, y, size: 12, font: boldFont });
    page.drawText('Odberatel:', { x: 300, y, size: 12, font: boldFont });
    y -= 20;

    page.drawText('BoostUp Supplements s.r.o.', { x: 50, y, size: 10, font });
    page.drawText('IC: 12345678', { x: 50, y: y - 15, size: 10, font });

    const delivery = order.delivery_info || {};
    const customerName = delivery.isCompany ? delivery.companyName : `${delivery.firstName || ''} ${delivery.lastName || ''}`;
    page.drawText(customerName || 'Zakaznik', { x: 300, y, size: 10, font });
    if (delivery.isCompany && delivery.ico) {
        page.drawText(`IC: ${delivery.ico}`, { x: 300, y: y - 15, size: 10, font });
        if (delivery.dic) page.drawText(`DIC: ${delivery.dic}`, { x: 300, y: y - 30, size: 10, font });
    }
    y -= 60;

    const date = new Date(order.created_at);
    page.drawText(`Datum vystaveni: ${date.toLocaleDateString('cs-CZ')}`, { x: 50, y, size: 10, font });
    y -= 40;

    page.drawText('Polozka', { x: 50, y, size: 10, font: boldFont });
    page.drawText('Mnozstvi', { x: 350, y, size: 10, font: boldFont });
    page.drawText('Cena', { x: 450, y, size: 10, font: boldFont });
    y -= 20;
    page.drawLine({ start: { x: 50, y }, end: { x: 545, y }, thickness: 1 });
    y -= 20;

    const items = order.items || [];
    for (const item of items) {
        page.drawText(item.name || 'Produkt', { x: 50, y, size: 10, font });
        page.drawText(String(item.quantity || 1), { x: 350, y, size: 10, font });
        page.drawText(`${item.price} CZK`, { x: 450, y, size: 10, font });
        y -= 20;
    }
    y -= 10;
    page.drawLine({ start: { x: 50, y }, end: { x: 545, y }, thickness: 1 });
    y -= 20;
    page.drawText('Celkem k uhrade:', { x: 300, y, size: 12, font: boldFont });
    page.drawText(`${order.total} CZK`, { x: 450, y, size: 12, font: boldFont });

    return await pdfDoc.save();
}
