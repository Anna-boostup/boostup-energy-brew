import { Resend } from 'resend';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import fs from 'fs';
import path from 'path';

// Logo embedded as Base64 to avoid Vercel filesystem/auth issues
const LOGO_BASE64 = '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';

const COLORS = {
    cream: '#f4f1e6',
    olive: '#3a572c',
    lime: '#dee16b',
    text: '#1a1a1a',
    muted: '#666666'
};

const BASE_URL = 'https://test.drinkboostup.cz';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        console.error('RESEND_API_KEY not set');
        return res.status(500).json({ error: 'Email service not configured' });
    }

    const resend = new Resend(apiKey);

    const {
        to,
        type = 'order_confirmation',
        customerName = 'zákazníku',
        orderNumber,
        items = [],
        total,
        trackingNumber,
        message, // For contact auto-reply
        magicLink, // For magic link
    } = req.body;

    if (!to) {
        return res.status(400).json({ error: 'Missing recipient email' });
    }

    let subject = 'BoostUp';
    let contentHtml = '';
    let heroImageUrl = '';
    let heroCid = '';

    switch (type) {
        case 'registration':
            subject = 'Vítej v týmu BoostUp! 🚀';
            heroImageUrl = `${BASE_URL}/email-welcome.png?v=3`;
            heroCid = 'welcome';
            contentHtml = `
                <h1 style="color:${COLORS.olive};margin-top:0">Ahoj ${customerName}!</h1>
                <p>Jsme nadšení, že ses přidal k BoostUp. Tvůj účet byl úspěšně vytvořen a teď už ti nic nebrání v cestě za maximálním výkonem.</p>
                <div style="margin:30px 0;text-align:center">
                    <a href="${BASE_URL}" style="background:${COLORS.olive};color:white;padding:14px 28px;border-radius:12px;text-decoration:none;font-weight:bold;display:inline-block">Doplnit zásoby energie</a>
                </div>
                <p>Pokud budeš cokoliv potřebovat, stačí odpovědět na tento e-mail.</p>
            `;
            break;

        case 'order_confirmation':
            subject = `✅ Potvrzení objednávky ${orderNumber} | BoostUp`;
            const itemsHtml = items.map((i: any) => {
                let details = '';
                let displayName = i.name;

                if (i.mixConfiguration) {
                    const flavors = [];
                    let totalBottles = 0;
                    if (i.mixConfiguration.lemon) {
                        flavors.push(`Lemon: ${i.mixConfiguration.lemon} ks`);
                        totalBottles += i.mixConfiguration.lemon;
                    }
                    if (i.mixConfiguration.red) {
                        flavors.push(`Red: ${i.mixConfiguration.red} ks`);
                        totalBottles += i.mixConfiguration.red;
                    }
                    if (i.mixConfiguration.silky) {
                        flavors.push(`Silky: ${i.mixConfiguration.silky} ks`);
                        totalBottles += i.mixConfiguration.silky;
                    }
                    details = `<div style="font-size:12px;color:${COLORS.muted};margin-top:4px">— ${flavors.join(', ')} (${totalBottles} ks celkem)</div>`;

                    // Update (MIX) to (MIX-totalBottles)
                    displayName = displayName.replace('(MIX)', `(MIX-${totalBottles})`);
                }
                return `<tr><td style="padding:10px 0;border-bottom:1px solid #eeeeee"><div>${displayName} × ${i.quantity}</div>${details}</td><td style="padding:10px 0;text-align:right;border-bottom:1px solid #eeeeee;vertical-align:top">${(i.price * i.quantity).toFixed(0)} Kč</td></tr>`;
            }).join('');

            contentHtml = `
                <h2 style="color:${COLORS.olive};margin-top:0">Díky za tvoji objednávku!</h2>
                <p>Ahoj ${customerName}, tvoje objednávka <strong>${orderNumber}</strong> byla úspěšně přijata. Už na ní začínáme pracovat.</p>
                <table style="width:100%;margin:20px 0;border-collapse:collapse">
                    ${itemsHtml}
                    <tr style="font-weight:bold;font-size:18px">
                        <td style="padding:15px 0">Celkem</td>
                        <td style="padding:15px 0;text-align:right">${Number(total).toFixed(0)} Kč</td>
                    </tr>
                </table>
                <p>Hned jak zásilku předáme dopravci, pošleme ti e-mail se sledovacím číslem.</p>
            `;
            break;

        case 'shipping':
            subject = `🚚 Tvoje zásilka ${orderNumber} je na cestě! | BoostUp`;
            heroImageUrl = `${BASE_URL}/email-shipping.png?v=3`;
            heroCid = 'shipping';
            const trackingUrl = `https://tracking.packeta.com/cs/?id=${trackingNumber}`;
            contentHtml = `
                <h2 style="color:${COLORS.olive};margin-top:0">Tvůj BoostUp je na cestě! 🚀</h2>
                <p>Tvůj balíček k objednávce <strong>${orderNumber}</strong> jsme právě předali Zásilkovně.</p>
                <div style="background:#ffffff;padding:24px;border-radius:12px;margin:24px 0;border:1px solid #eeeeee;text-align:center">
                    <p style="margin-top:0;font-size:12px;color:${COLORS.muted};text-transform:uppercase;font-weight:bold;letter-spacing:1px">Sledovací číslo</p>
                    <p style="font-size:20px;font-weight:bold;margin:10px 0;color:${COLORS.olive}">${trackingNumber}</p>
                    <a href="${trackingUrl}" style="background:${COLORS.olive};color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block;margin-top:10px">Sledovat zásilku</a>
                </div>
            `;
            break;

        case 'contact_auto_reply':
            subject = 'Díky za tvou zprávu! | BoostUp';
            contentHtml = `
                <h2 style="color:${COLORS.olive};margin-top:0">Zpráva přijata ⚡</h2>
                <p>Ahoj, tvoje zpráva dorazila k nám do BoostUpu. Ozveme se ti co nejdříve, obvykle to netrvá déle než pár hodin.</p>
                <div style="background:#ffffff;padding:20px;border-radius:12px;margin:20px 0;border:1px solid #eeeeee;font-style:italic">
                    "${message}"
                </div>
                <p>Zatím můžeš mrknout na naše novinky na <a href="https://instagram.com/drinkboostup" style="color:${COLORS.olive}">Instagramu</a>.</p>
            `;
            break;

        case 'magic_link':
            subject = 'Přihlášení do BoostUp ⚡';
            contentHtml = `
                <h2 style="color:${COLORS.olive};margin-top:0">Tvůj odkaz pro přihlášení</h2>
                <p>Kliknutím na tlačítko níže budeš okamžitě přihlášen ke svému účtu.</p>
                <div style="margin:32px 0;text-align:center">
                    <a href="${magicLink}" style="background:${COLORS.olive};color:white;padding:14px 28px;border-radius:12px;text-decoration:none;font-weight:bold;display:inline-block">Přihlásit se</a>
                </div>
                <p style="font-size:13px;color:${COLORS.muted}">Tento odkaz je platný pouze po omezenou dobu. Pokud jsi jsi ho nevyžádal, můžeš tento e-mail ignorovat.</p>
            `;
            break;
    }


    const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
    </head>
    <body style="margin:0;padding:0;background-color:${COLORS.cream};font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;color:${COLORS.text}">
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
            <tr>
                <td align="center" style="padding:40px 0">
                    <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color:white;border-radius:24px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.05)">
                        <!-- Header -->
                        <tr>
                            <td align="center" style="padding:40px 20px;background-color:white;border-bottom:1px solid #f0f0f0">
                                <img src="cid:logo" alt="BoostUp" width="180" border="0" style="display:block;height:auto;border:none;outline:none;text-decoration:none">
                            </td>
                        </tr>
                        
                        ${heroImageUrl ? `
                        <tr>
                            <td>
                                <img src="cid:hero" alt="" width="600" border="0" style="width:600px;max-width:100%;height:auto;display:block;border:none;outline:none;text-decoration:none">
                            </td>
                        </tr>
                        ` : ''}

                        <!-- Body -->
                        <tr>
                            <td style="padding:48px 40px;line-height:1.6;font-size:16px">
                                ${contentHtml}
                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td align="center" style="padding:40px;background-color:#fafafa;font-size:13px;color:${COLORS.muted}">
                                <p style="margin:0 0 10px 0">BoostUp &middot; Chaloupkova 3002/1a &middot; 612 00 Brno</p>
                                <p style="margin:0">
                                    <a href="${BASE_URL}" style="color:${COLORS.olive};text-decoration:none;font-weight:bold">drinkboostup.cz</a>
                                    &nbsp;&nbsp;&middot;&nbsp;&nbsp;
                                    <a href="mailto:info@drinkboostup.cz" style="color:${COLORS.olive};text-decoration:none">info@drinkboostup.cz</a>
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;

    try {
        const attachments: any[] = [
            {
                content: LOGO_BASE64,
                filename: 'logo.png',
                contentId: 'logo',
                disposition: 'inline'
            }
        ];

        if (heroImageUrl) {
            try {
                const imageName = heroImageUrl.split('/').pop()?.split('?')[0];
                if (imageName) {
                    const heroPath = path.join(process.cwd(), 'public', imageName);
                    if (fs.existsSync(heroPath)) {
                        const heroContent = fs.readFileSync(heroPath).toString('base64');
                        attachments.push({
                            content: heroContent,
                            filename: `${heroCid}.png`,
                            contentId: 'hero',
                            disposition: 'inline'
                        });
                    }
                }
            } catch (e) {
                console.error('Failed to read hero image file:', e);
            }
        }

        const { data, error } = await resend.emails.send({
            from: 'BoostUp <objednavky@drinkboostup.cz>',
            to: [to],
            subject: subject,
            html: emailHtml,
            attachments: attachments
        });

        if (error) {
            console.error('Resend SDK error:', error);
            return res.status(500).json({ error });
        }

        return res.status(200).json({ success: true, id: data?.id });
    } catch (err) {
        console.error('Email send error:', err);
        return res.status(500).json({ error: 'Failed to send email' });
    }
}
