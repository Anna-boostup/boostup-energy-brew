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

        // Segment orders:
        // E-shop: web orders OR manual orders where paymentMethod is NOT 'promo'
        // Promo/Gifts: manual orders where paymentMethod is 'promo'
        const eshopOrders = reportOrders.filter(o => {
            const delInfo = o.delivery_info || {};
            return delInfo.paymentMethod !== 'promo';
        });
        const promoOrders = reportOrders.filter(o => {
            const delInfo = o.delivery_info || {};
            return delInfo.paymentMethod === 'promo';
        });

        // Process all reports
        const totalReport = processOrders(reportOrders);
        const eshopReport = processOrders(eshopOrders);
        const promoReport = processOrders(promoOrders);

        const monthName = firstDayOfPrevMonth.toLocaleString('cs-CZ', { month: 'long' });
        const year = firstDayOfPrevMonth.getFullYear();

        const reportTitle = `Měsíční report objednávek BoostUp - ${monthName} ${year}`;

        // Fetch report settings from site_content
        const { data: contentRow } = await supabase
            .from('site_content')
            .select('content')
            .eq('id', 'main')
            .single();

        const dbContent = contentRow?.content || {};
        const emailTo = dbContent.reportRecipientEmail || process.env.REPORT_EMAIL || 'objednavky@drinkboostup.cz';
        
        let ccEmails: string[] = [];
        if (dbContent.reportRecipientCc) {
            ccEmails = dbContent.reportRecipientCc.split(',').map((e: string) => e.trim()).filter(Boolean);
        } else if (process.env.REPORT_EMAIL_CC) {
            ccEmails = process.env.REPORT_EMAIL_CC.split(',').map((e: string) => e.trim()).filter(Boolean);
        }

        // Send Email
        const resendApiKey = process.env.RESEND_API_KEY;
        if (!resendApiKey) {
            throw new Error("Missing RESEND_API_KEY");
        }
        const resend = new Resend(resendApiKey);

        // HTML Content
        const htmlContent = `
            <div style="font-family: sans-serif; max-width: 650px; margin: 0 auto; padding: 25px; color: #1f2937; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #f9fafb;">
                <div style="text-align: center; border-bottom: 2px solid #3d5a2f; padding-bottom: 20px; margin-bottom: 25px;">
                    <h1 style="color: #3d5a2f; margin: 0; font-size: 28px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;">BoostUp Měsíční Report</h1>
                    <p style="color: #6b7280; font-size: 14px; font-weight: 600; margin: 5px 0 0 0; text-transform: uppercase; letter-spacing: 0.1em;">${monthName} ${year}</p>
                </div>

                <p style="font-size: 15px; line-height: 1.6; color: #374151;">Dobrý den,<br />v příloze naleznete automaticky vygenerované exporty objednávek BoostUp za uplynulý měsíc pro vaše účetnictví.</p>

                <!-- 1. CELKOVÝ PŘEHLED -->
                <div style="background-color: #ffffff; padding: 20px; border-radius: 12px; border: 1px solid #e5e7eb; margin-bottom: 20px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
                    <h2 style="color: #3d5a2f; margin-top: 0; font-size: 18px; border-bottom: 1px solid #f3f4f6; padding-bottom: 8px;">📊 Celkový přehled (všechny objednávky)</h2>
                    <table style="width: 100%; border-collapse: collapse; font-size: 14px; line-height: 1.8;">
                        <tr>
                            <td style="font-weight: bold; color: #4b5563; width: 60%;">Celkem objednávek (bez stornovaných):</td>
                            <td style="font-weight: 800; text-align: right; color: #111827;">${totalReport.paidOrdersCount}</td>
                        </tr>
                        <tr>
                            <td style="font-weight: bold; color: #4b5563;">Stornováno objednávek:</td>
                            <td style="font-weight: 800; text-align: right; color: #9ca3af;">${totalReport.cancelledOrdersCount}</td>
                        </tr>
                        <tr>
                            <td style="font-weight: bold; color: #4b5563; border-top: 1px dashed #e5e7eb; padding-top: 5px;">Celkový obrat (vč. DPH):</td>
                            <td style="font-weight: 850; text-align: right; color: #3d5a2f; border-top: 1px dashed #e5e7eb; padding-top: 5px; font-size: 16px;">${totalReport.totalRevenue.toLocaleString('cs-CZ')} Kč</td>
                        </tr>
                    </table>
                    <h3 style="color: #4b5563; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; margin: 15px 0 8px 0;">Prodané kusy (lahve):</h3>
                    <table style="width: 100%; font-size: 13px;">
                        <tr>
                            <td style="color: #6b7280;">Lemon Blast: <strong style="color: #111827;">${totalReport.totalsByFlavor.lemon} ks</strong></td>
                            <td style="color: #6b7280;">Red Rush: <strong style="color: #111827;">${totalReport.totalsByFlavor.red} ks</strong></td>
                            <td style="color: #6b7280;">Silky Leaf: <strong style="color: #111827;">${totalReport.totalsByFlavor.silky} ks</strong></td>
                        </tr>
                    </table>
                </div>

                <!-- 2. ZA E-SHOP -->
                <div style="background-color: #ffffff; padding: 20px; border-radius: 12px; border: 1px solid #e5e7eb; margin-bottom: 20px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
                    <h2 style="color: #3d5a2f; margin-top: 0; font-size: 18px; border-bottom: 1px solid #f3f4f6; padding-bottom: 8px;">🛒 Za E-shop (web + běžné prodeje)</h2>
                    <table style="width: 100%; border-collapse: collapse; font-size: 14px; line-height: 1.8;">
                        <tr>
                            <td style="font-weight: bold; color: #4b5563; width: 60%;">Celkem objednávek (bez stornovaných):</td>
                            <td style="font-weight: 800; text-align: right; color: #111827;">${eshopReport.paidOrdersCount}</td>
                        </tr>
                        <tr>
                            <td style="font-weight: bold; color: #4b5563;">Stornováno objednávek:</td>
                            <td style="font-weight: 800; text-align: right; color: #9ca3af;">${eshopReport.cancelledOrdersCount}</td>
                        </tr>
                        <tr>
                            <td style="font-weight: bold; color: #4b5563; border-top: 1px dashed #e5e7eb; padding-top: 5px;">Obrat E-shopu (vč. DPH):</td>
                            <td style="font-weight: 850; text-align: right; color: #3d5a2f; border-top: 1px dashed #e5e7eb; padding-top: 5px; font-size: 16px;">${eshopReport.totalRevenue.toLocaleString('cs-CZ')} Kč</td>
                        </tr>
                    </table>
                    <h3 style="color: #4b5563; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; margin: 15px 0 8px 0;">Prodané kusy (lahve):</h3>
                    <table style="width: 100%; font-size: 13px;">
                        <tr>
                            <td style="color: #6b7280;">Lemon Blast: <strong style="color: #111827;">${eshopReport.totalsByFlavor.lemon} ks</strong></td>
                            <td style="color: #6b7280;">Red Rush: <strong style="color: #111827;">${eshopReport.totalsByFlavor.red} ks</strong></td>
                            <td style="color: #6b7280;">Silky Leaf: <strong style="color: #111827;">${eshopReport.totalsByFlavor.silky} ks</strong></td>
                        </tr>
                    </table>
                </div>

                <!-- 3. ZA PROMO / DÁRKY -->
                <div style="background-color: #ffffff; padding: 20px; border-radius: 12px; border: 1px solid #e5e7eb; margin-bottom: 20px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
                    <h2 style="color: #3d5a2f; margin-top: 0; font-size: 18px; border-bottom: 1px solid #f3f4f6; padding-bottom: 8px;">🎁 Za Promo / Dárky</h2>
                    <table style="width: 100%; border-collapse: collapse; font-size: 14px; line-height: 1.8;">
                        <tr>
                            <td style="font-weight: bold; color: #4b5563; width: 60%;">Rozdané promo objednávky:</td>
                            <td style="font-weight: 800; text-align: right; color: #111827;">${promoReport.paidOrdersCount}</td>
                        </tr>
                        <tr>
                            <td style="font-weight: bold; color: #4b5563;">Stornováno objednávek:</td>
                            <td style="font-weight: 800; text-align: right; color: #9ca3af;">${promoReport.cancelledOrdersCount}</td>
                        </tr>
                        <tr>
                            <td style="font-weight: bold; color: #4b5563; border-top: 1px dashed #e5e7eb; padding-top: 5px;">Promo hodnota (případné doplatky):</td>
                            <td style="font-weight: 850; text-align: right; color: #3d5a2f; border-top: 1px dashed #e5e7eb; padding-top: 5px; font-size: 16px;">${promoReport.totalRevenue.toLocaleString('cs-CZ')} Kč</td>
                        </tr>
                    </table>
                    <h3 style="color: #4b5563; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; margin: 15px 0 8px 0;">Prodané kusy (lahve):</h3>
                    <table style="width: 100%; font-size: 13px;">
                        <tr>
                            <td style="color: #6b7280;">Lemon Blast: <strong style="color: #111827;">${promoReport.totalsByFlavor.lemon} ks</strong></td>
                            <td style="color: #6b7280;">Red Rush: <strong style="color: #111827;">${promoReport.totalsByFlavor.red} ks</strong></td>
                            <td style="color: #6b7280;">Silky Leaf: <strong style="color: #111827;">${promoReport.totalsByFlavor.silky} ks</strong></td>
                        </tr>
                    </table>
                </div>

                <div style="border-top: 1px solid #e5e7eb; padding-top: 15px; margin-top: 25px; text-align: center; font-size: 12px; color: #9ca3af;">
                    Tento e-mail byl automaticky vygenerován systémem BoostUp Admin.<br />
                    Nastavení příjemců můžete změnit přímo v administraci v sekci <strong>Nastavení webu</strong>.
                </div>
            </div>
        `;

        // Send consolidated report email
        await resend.emails.send({
            from: 'BoostUp Systém <info@drinkboostup.cz>',
            to: emailTo,
            cc: ccEmails.length > 0 ? ccEmails : undefined,
            subject: reportTitle,
            html: htmlContent,
            attachments: [
                {
                    filename: `boostup-celkovy-prehled-${firstDayOfPrevMonth.getMonth() + 1}-${year}.csv`,
                    content: Buffer.from(totalReport.csvContent, 'utf-8')
                },
                {
                    filename: `boostup-eshop-${firstDayOfPrevMonth.getMonth() + 1}-${year}.csv`,
                    content: Buffer.from(eshopReport.csvContent, 'utf-8')
                },
                {
                    filename: `boostup-promodarky-${firstDayOfPrevMonth.getMonth() + 1}-${year}.csv`,
                    content: Buffer.from(promoReport.csvContent, 'utf-8')
                }
            ]
        });

        return res.status(200).json({
            success: true,
            reports: {
                month: monthName,
                year,
                total: {
                    paidOrdersCount: totalReport.paidOrdersCount,
                    cancelledOrdersCount: totalReport.cancelledOrdersCount,
                    totalRevenue: totalReport.totalRevenue,
                    totalsByFlavor: totalReport.totalsByFlavor
                },
                eshop: {
                    paidOrdersCount: eshopReport.paidOrdersCount,
                    cancelledOrdersCount: eshopReport.cancelledOrdersCount,
                    totalRevenue: eshopReport.totalRevenue,
                    totalsByFlavor: eshopReport.totalsByFlavor
                },
                promo: {
                    paidOrdersCount: promoReport.paidOrdersCount,
                    cancelledOrdersCount: promoReport.cancelledOrdersCount,
                    totalRevenue: promoReport.totalRevenue,
                    totalsByFlavor: promoReport.totalsByFlavor
                }
            }
        });

    } catch (e: any) {
        console.error("Cron Error:", e);
        return res.status(500).json({ error: e.message });
    }
}
