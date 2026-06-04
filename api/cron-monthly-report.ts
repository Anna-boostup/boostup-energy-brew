import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Initialize Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

const escapeCsv = (str: any) => {
    if (str === null || str === undefined) return '';
    const s = String(str);
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
        return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Basic protection against unwanted calls.
    // Vercel cron jobs pass an Authorization header starting with "Bearer " and the CRON_SECRET
    const authHeader = req.headers.authorization;
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        // Determine previous month range
        const now = new Date();
        const firstDayOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDayOfPrevMonth = new Date(firstDayOfCurrentMonth.getTime() - 1);
        const firstDayOfPrevMonth = new Date(lastDayOfPrevMonth.getFullYear(), lastDayOfPrevMonth.getMonth(), 1);

        const isoStart = firstDayOfPrevMonth.toISOString();
        const isoEnd = lastDayOfPrevMonth.toISOString();

        // Fetch orders for the previous month
        const { data: orders, error } = await supabase
            .from('orders')
            .select('*')
            .gte('created_at', isoStart)
            .lte('created_at', isoEnd)
            .order('created_at', { ascending: true });

        if (error) {
            throw error;
        }

        const reportOrders = orders || [];

        // Compute statistics
        let totalRevenue = 0;
        let totalsByFlavor = { lemon: 0, red: 0, silky: 0 };
        let paidOrdersCount = 0;
        let cancelledOrdersCount = 0;

        // Generate CSV header
        let csvContent = '\uFEFF'; // BOM for Excel UTF-8 support
        csvContent += 'ID,Datum,Status,Zákazník,Email,Suma_Kč,Položky,Ulice,Město,PSČ,Doprava,Platba\n';

        for (const order of reportOrders) {
            if (order.status === 'cancelled') {
                cancelledOrdersCount++;
            } else {
                paidOrdersCount++;
                totalRevenue += order.total || 0;

                // Count flavors for paid/completed orders
                const items = order.items || [];
                items.forEach((item: any) => {
                    const qty = item.quantity || 1;
                    if (item.mixConfiguration) {
                        totalsByFlavor.lemon += (item.mixConfiguration.lemon || 0) * qty;
                        totalsByFlavor.red += (item.mixConfiguration.red || 0) * qty;
                        totalsByFlavor.silky += (item.mixConfiguration.silky || 0) * qty;
                    } else if (item.sku) {
                        const sku = item.sku.toLowerCase();
                        let packs = 1;
                        if (sku.endsWith('-3')) packs = 3;
                        if (sku.endsWith('-12')) packs = 12;

                        if (sku.includes('lemon')) totalsByFlavor.lemon += qty * packs;
                        else if (sku.includes('red')) totalsByFlavor.red += qty * packs;
                        else if (sku.includes('silky')) totalsByFlavor.silky += qty * packs;
                    }
                });
            }

            // Generate CSV Row
            const itemsStr = (order.items || []).map((i: any) => `${i.quantity}x ${i.name || i.sku}`).join('; ');
            const delInfo = order.delivery_info || {};
            
            const row = [
                order.id,
                new Date(order.created_at).toLocaleDateString('cs-CZ'),
                order.status,
                order.customer_name || '',
                order.customer_email || '',
                order.total || 0,
                itemsStr,
                delInfo.street || '',
                delInfo.city || '',
                delInfo.zip || '',
                delInfo.deliveryMethod || '',
                delInfo.paymentMethod || ''
            ];

            csvContent += row.map(escapeCsv).join(',') + '\n';
        }

        const monthName = firstDayOfPrevMonth.toLocaleString('cs-CZ', { month: 'long' });
        const year = firstDayOfPrevMonth.getFullYear();
        const reportTitle = `Report objednávek - ${monthName} ${year}`;

        // Send Email
        const resendApiKey = process.env.RESEND_API_KEY;
        if (!resendApiKey) {
            throw new Error("Missing RESEND_API_KEY");
        }
        const resend = new Resend(resendApiKey);

        const emailTo = process.env.REPORT_EMAIL || 'objednavky@drinkboostup.cz';
        const ccEmails = process.env.REPORT_EMAIL_CC ? process.env.REPORT_EMAIL_CC.split(',').map((e:string) => e.trim()) : [];

        const htmlContent = `
            <div style="font-family: sans-serif; max-w-2xl; margin: 0 auto; padding: 20px; color: #1f2937;">
                <h1 style="color: #3a572c;">${reportTitle}</h1>
                <p>V příloze naleznete automaticky vygenerovaný export objednávek z e-shopu BoostUp za uplynulý měsíc pro vaše účetnictví.</p>
                
                <h2 style="margin-top: 30px;">Základní přehled:</h2>
                <ul style="font-size: 16px; line-height: 1.6;">
                    <li><strong>Celkem objednávek (bez storen):</strong> ${paidOrdersCount}</li>
                    <li><strong>Stornováno:</strong> ${cancelledOrdersCount}</li>
                    <li><strong>Celkový obrat (vč. DPH):</strong> ${totalRevenue.toLocaleString('cs-CZ')} Kč</li>
                </ul>

                <h2 style="margin-top: 30px;">Prodané kusy (lahve):</h2>
                <ul style="font-size: 16px; line-height: 1.6;">
                    <li><strong>Lemon Blast:</strong> ${totalsByFlavor.lemon} ks</li>
                    <li><strong>Red Rush:</strong> ${totalsByFlavor.red} ks</li>
                    <li><strong>Silky Leaf:</strong> ${totalsByFlavor.silky} ks</li>
                </ul>

                <p style="margin-top: 40px; font-size: 14px; color: #6b7280;">
                    Tento e-mail byl vygenerován automaticky ze systému BoostUp Admin.
                </p>
            </div>
        `;

        await resend.emails.send({
            from: 'BoostUp Systém <info@drinkboostup.cz>',
            to: emailTo,
            cc: ccEmails.length > 0 ? ccEmails : undefined,
            subject: reportTitle,
            html: htmlContent,
            attachments: [
                {
                    filename: `boostup-objednavky-${firstDayOfPrevMonth.getMonth() + 1}-${year}.csv`,
                    content: Buffer.from(csvContent, 'utf-8')
                }
            ]
        });

        return res.status(200).json({
            success: true,
            report: {
                month: monthName,
                year,
                paidOrdersCount,
                cancelledOrdersCount,
                totalRevenue,
                totalsByFlavor
            }
        });

    } catch (e: any) {
        console.error("Cron Error:", e);
        return res.status(500).json({ error: e.message });
    }
}
