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

const processOrders = (ordersList: any[]) => {
    let totalRevenue = 0;
    let totalsByFlavor = { lemon: 0, red: 0, silky: 0 };
    let paidOrdersCount = 0;
    let cancelledOrdersCount = 0;

    let csvContent = '\uFEFF'; // BOM for Excel UTF-8 support
    csvContent += 'ID,Datum,Status,Zákazník,Email,Suma_Kč,Položky,Ulice,Město,PSČ,Doprava,Platba\n';

    for (const order of ordersList) {
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

    return {
        totalRevenue,
        totalsByFlavor,
        paidOrdersCount,
        cancelledOrdersCount,
        csvContent
    };
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

        // Split orders into web purchases and manual orders
        const webOrders = reportOrders.filter(o => !o.id.startsWith('MAN-'));
        const manualOrders = reportOrders.filter(o => o.id.startsWith('MAN-'));

        // Process both groups
        const webReport = processOrders(webOrders);
        const manualReport = processOrders(manualOrders);

        const monthName = firstDayOfPrevMonth.toLocaleString('cs-CZ', { month: 'long' });
        const year = firstDayOfPrevMonth.getFullYear();

        const webReportTitle = `Report webových objednávek - ${monthName} ${year}`;
        const manualReportTitle = `Report manuálních objednávek - ${monthName} ${year}`;

        // Send Email
        const resendApiKey = process.env.RESEND_API_KEY;
        if (!resendApiKey) {
            throw new Error("Missing RESEND_API_KEY");
        }
        const resend = new Resend(resendApiKey);

        const emailTo = process.env.REPORT_EMAIL || 'objednavky@drinkboostup.cz';
        const ccEmails = process.env.REPORT_EMAIL_CC ? process.env.REPORT_EMAIL_CC.split(',').map((e:string) => e.trim()) : [];

        // Web orders HTML content
        const webHtmlContent = `
            <div style="font-family: sans-serif; max-w-2xl; margin: 0 auto; padding: 20px; color: #1f2937;">
                <h1 style="color: #3a572c;">${webReportTitle}</h1>
                <p>V příloze naleznete automaticky vygenerovaný export nákupů na webu (e-shopu) BoostUp za uplynulý měsíc pro vaše účetnictví.</p>
                
                <h2 style="margin-top: 30px;">Základní přehled:</h2>
                <ul style="font-size: 16px; line-height: 1.6;">
                    <li><strong>Celkem objednávek (bez storen):</strong> ${webReport.paidOrdersCount}</li>
                    <li><strong>Stornováno:</strong> ${webReport.cancelledOrdersCount}</li>
                    <li><strong>Celkový obrat (vč. DPH):</strong> ${webReport.totalRevenue.toLocaleString('cs-CZ')} Kč</li>
                </ul>

                <h2 style="margin-top: 30px;">Prodané kusy (lahve):</h2>
                <ul style="font-size: 16px; line-height: 1.6;">
                    <li><strong>Lemon Blast:</strong> ${webReport.totalsByFlavor.lemon} ks</li>
                    <li><strong>Red Rush:</strong> ${webReport.totalsByFlavor.red} ks</li>
                    <li><strong>Silky Leaf:</strong> ${webReport.totalsByFlavor.silky} ks</li>
                </ul>

                <p style="margin-top: 40px; font-size: 14px; color: #6b7280;">
                    Tento e-mail byl vygenerován automaticky ze systému BoostUp Admin.
                </p>
            </div>
        `;

        // Manual orders HTML content
        const manualHtmlContent = `
            <div style="font-family: sans-serif; max-w-2xl; margin: 0 auto; padding: 20px; color: #1f2937;">
                <h1 style="color: #3a572c;">${manualReportTitle}</h1>
                <p>V příloze naleznete automaticky vygenerovaný export manuálně vytvořených objednávek BoostUp za uplynulý měsíc pro vaše účetnictví.</p>
                
                <h2 style="margin-top: 30px;">Základní přehled:</h2>
                <ul style="font-size: 16px; line-height: 1.6;">
                    <li><strong>Celkem objednávek (bez storen):</strong> ${manualReport.paidOrdersCount}</li>
                    <li><strong>Stornováno:</strong> ${manualReport.cancelledOrdersCount}</li>
                    <li><strong>Celkový obrat (vč. DPH):</strong> ${manualReport.totalRevenue.toLocaleString('cs-CZ')} Kč</li>
                </ul>

                <h2 style="margin-top: 30px;">Prodané kusy (lahve):</h2>
                <ul style="font-size: 16px; line-height: 1.6;">
                    <li><strong>Lemon Blast:</strong> ${manualReport.totalsByFlavor.lemon} ks</li>
                    <li><strong>Red Rush:</strong> ${manualReport.totalsByFlavor.red} ks</li>
                    <li><strong>Silky Leaf:</strong> ${manualReport.totalsByFlavor.silky} ks</li>
                </ul>

                <p style="margin-top: 40px; font-size: 14px; color: #6b7280;">
                    Tento e-mail byl vygenerován automaticky ze systému BoostUp Admin.
                </p>
            </div>
        `;

        // Send Web report email
        await resend.emails.send({
            from: 'BoostUp Systém <info@drinkboostup.cz>',
            to: emailTo,
            cc: ccEmails.length > 0 ? ccEmails : undefined,
            subject: webReportTitle,
            html: webHtmlContent,
            attachments: [
                {
                    filename: `boostup-webove-objednavky-${firstDayOfPrevMonth.getMonth() + 1}-${year}.csv`,
                    content: Buffer.from(webReport.csvContent, 'utf-8')
                }
            ]
        });

        // Send Manual report email
        await resend.emails.send({
            from: 'BoostUp Systém <info@drinkboostup.cz>',
            to: emailTo,
            cc: ccEmails.length > 0 ? ccEmails : undefined,
            subject: manualReportTitle,
            html: manualHtmlContent,
            attachments: [
                {
                    filename: `boostup-manualni-objednavky-${firstDayOfPrevMonth.getMonth() + 1}-${year}.csv`,
                    content: Buffer.from(manualReport.csvContent, 'utf-8')
                }
            ]
        });

        return res.status(200).json({
            success: true,
            reports: {
                month: monthName,
                year,
                web: {
                    paidOrdersCount: webReport.paidOrdersCount,
                    cancelledOrdersCount: webReport.cancelledOrdersCount,
                    totalRevenue: webReport.totalRevenue,
                    totalsByFlavor: webReport.totalsByFlavor
                },
                manual: {
                    paidOrdersCount: manualReport.paidOrdersCount,
                    cancelledOrdersCount: manualReport.cancelledOrdersCount,
                    totalRevenue: manualReport.totalRevenue,
                    totalsByFlavor: manualReport.totalsByFlavor
                }
            }
        });

    } catch (e: any) {
        console.error("Cron Error:", e);
        return res.status(500).json({ error: e.message });
    }
}
