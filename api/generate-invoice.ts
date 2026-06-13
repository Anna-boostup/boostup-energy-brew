import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const orderId = req.query.orderId as string;
    if (!orderId) {
        return res.status(400).json({ error: 'Missing orderId' });
    }

    try {
        const { data: order, error } = await supabaseAdmin
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .single();

        if (error || !order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        
        let y = 800;
        
        // Header
        page.drawText('FAKTURA - DANOVY DOKLAD', { x: 50, y, size: 20, font: boldFont });
        y -= 30;
        page.drawText(`Cislo dokladu: ${order.id}`, { x: 50, y, size: 12, font });
        
        y -= 40;
        
        // Supplier and Customer
        page.drawText('Dodavatel:', { x: 50, y, size: 12, font: boldFont });
        page.drawText('Odberatel:', { x: 300, y, size: 12, font: boldFont });
        y -= 20;
        
        // Supplier details (Hardcoded for BoostUp)
        page.drawText('BoostUp Supplements s.r.o.', { x: 50, y, size: 10, font });
        page.drawText('IC: 12345678', { x: 50, y: y - 15, size: 10, font });
        
        // Customer details
        const delivery = order.delivery_info || {};
        const customerName = delivery.isCompany ? delivery.companyName : `${delivery.firstName || ''} ${delivery.lastName || ''}`;
        page.drawText(customerName || 'Zakaznik', { x: 300, y, size: 10, font });
        if (delivery.isCompany && delivery.ico) {
            page.drawText(`IC: ${delivery.ico}`, { x: 300, y: y - 15, size: 10, font });
            if (delivery.dic) {
                page.drawText(`DIC: ${delivery.dic}`, { x: 300, y: y - 30, size: 10, font });
            }
        }
        
        y -= 60;
        
        const date = new Date(order.created_at);
        page.drawText(`Datum vystaveni: ${date.toLocaleDateString('cs-CZ')}`, { x: 50, y, size: 10, font });
        
        y -= 40;
        
        // Items Header
        page.drawText('Polozka', { x: 50, y, size: 10, font: boldFont });
        page.drawText('Mnozstvi', { x: 350, y, size: 10, font: boldFont });
        page.drawText('Cena', { x: 450, y, size: 10, font: boldFont });
        
        y -= 20;
        page.drawLine({ start: { x: 50, y }, end: { x: 545, y }, thickness: 1 });
        y -= 20;
        
        // Items
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
        
        // Total
        page.drawText(`Celkem k uhrade:`, { x: 300, y, size: 12, font: boldFont });
        page.drawText(`${order.total} CZK`, { x: 450, y, size: 12, font: boldFont });

        const pdfBytes = await pdfDoc.save();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="faktura-${order.id}.pdf"`);
        return res.status(200).send(Buffer.from(pdfBytes));

    } catch (error) {
        console.error('Error generating PDF:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
