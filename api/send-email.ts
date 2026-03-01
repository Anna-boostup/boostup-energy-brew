import type { VercelRequest, VercelResponse } from '@vercel/node';
import fs from 'fs';
import path from 'path';

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
        // Build inline attachments using Resend's contentId + content (Base64) approach.
        // We read the image directly from the filesystem to avoid network fetching.
        // Using path: URL would fail because test.drinkboostup.cz is behind Vercel auth.
        const attachments: Array<{ content: string; filename: string; contentId: string }> = [];

        try {
            const logoPath = path.join(process.cwd(), 'public', 'logo-green.png');
            const logoContent = fs.readFileSync(logoPath).toString('base64');
            attachments.push({ content: logoContent, filename: 'logo.png', contentId: 'logo' });
        } catch (e) {
            console.error('Failed to read logo file:', e);
        }

        if (heroImageUrl) {
            try {
                const imageName = heroImageUrl.split('/').pop()?.split('?')[0];
                if (imageName) {
                    const heroPath = path.join(process.cwd(), 'public', imageName);
                    const heroContent = fs.readFileSync(heroPath).toString('base64');
                    attachments.push({ content: heroContent, filename: `${heroCid}.png`, contentId: 'hero' });
                }
            } catch (e) {
                console.error('Failed to read hero image file:', e);
            }
        }

        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: 'BoostUp <objednavky@drinkboostup.cz>',
                to,
                subject,
                html: emailHtml,
                attachments
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Resend API error:', data);
            return res.status(response.status).json({ error: data });
        }

        return res.status(200).json({ success: true, id: data.id });
    } catch (err) {
        console.error('Email send error:', err);
        return res.status(500).json({ error: 'Failed to send email' });
    }
}
