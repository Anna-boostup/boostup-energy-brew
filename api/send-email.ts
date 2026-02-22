import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        console.error('RESEND_API_KEY not set');
        return res.status(500).json({ error: 'Email service not configured' });
    }

    const { to, orderNumber, customerName, items, total } = req.body;

    if (!to || !orderNumber) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const itemsHtml = (items || []).map((i: { name: string; quantity: number; price: number }) =>
        `<tr><td style="padding:6px 0">${i.name} × ${i.quantity}</td><td style="padding:6px 0;text-align:right">${(i.price * i.quantity).toFixed(0)} Kč</td></tr>`
    ).join('');

    const html = `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a">
      <div style="background:#2d5a27;padding:24px;border-radius:12px 12px 0 0;text-align:center">
        <h1 style="color:#fff;margin:0;font-size:24px">BOOSTUP.</h1>
      </div>
      <div style="background:#f9f9f9;padding:32px;border-radius:0 0 12px 12px">
        <h2 style="margin-top:0">Potvrzení objednávky</h2>
        <p>Ahoj <strong>${customerName}</strong>, tvoje objednávka byla úspěšně přijata!</p>
        <p><strong>Číslo objednávky:</strong> ${orderNumber}</p>
        <table style="width:100%;border-top:1px solid #e0e0e0;border-bottom:1px solid #e0e0e0;margin:16px 0">
          ${itemsHtml}
          <tr style="font-weight:bold;font-size:16px">
            <td style="padding:10px 0">Celkem</td>
            <td style="padding:10px 0;text-align:right">${Number(total).toFixed(0)} Kč</td>
          </tr>
        </table>
        <p>Zanedlouho ti pošleme informace o doručení.</p>
        <p style="color:#666;font-size:13px">Dotazy: <a href="mailto:info@drinkboostup.cz">info@drinkboostup.cz</a> &middot; +420 775 222 037</p>
      </div>
    </div>`;

    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: 'objednavky@drinkboostup.cz',
                to,
                subject: `✅ Potvrzení objednávky ${orderNumber} | BoostUp`,
                html
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
