
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

const LOGO_BASE64 = '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b5n3J+MCM3q6BH69cuXE0e/L8jzZe3jiDc0U5lmUgje/q7u5Ol6XxYrQoIAqIAqKAKCAKiAKigCggCvhSgeyUAuUAwAy1AYJpdGa3quyP4l1A+MmeeMraIxK58V9RtXn00wTQXJ5y4xYNmdXlabtYLQqIAqKAKCAKlL4C0bb6cxe11cdsxF0LKJe+hGKhKCAKFEOBacoMjANg8dJIAzf+O6axRw4r/ARqXJrsGviGTTFm7xg/nM/HRTbL8Dc2JeZWhx/0N0dhJwqIAqKAKCAKiAJOFUCguAbqshCvfRgernTKS/KJAqKAKJBNgemOBcYBkNawYjpjyvz4GFSqw888ceBbPYn+Dba1GEvTWi7yxSPHLf3O7u7uR/v3BvEEx9Kz/8Nf9K0XDV57pvvO6Aky8/5E7idU/VYU7yI48m06mPfKpfIsCHvS6tV9vAbN8W89n6n/iH9vL++3h6l546v0MHt90f488P9z377y/K0T2Pof+H/v6v9eO9r70vvd/L4H/x7+/of8H4mD0uueX70rv/8D///OfxLwP+/+f9p9O4P9z/9e+/7/9f+/+v+H9L70vve+97///y+R//8n/9//+p8H/9/f/++9L7//7///+/v/X99L7Pvof8vge/9f7+/7///vP659//////vf///v9P/2ff/9L7+/9f//99f7+/7///9////////////////////////';

interface OrderWebhookPayload {
  type: string;
  table: string;
  record: {
    id: string;
    customer_email: string;
    customer_name: string;
    total: number;
    items: any[];
    delivery_info: {
      firstName: string;
      lastName: string;
      phone: string;
      street: string;
      city: string;
      zip: string;
      deliveryMethod: string;
      paymentMethod: string;
      packetaPointId?: string;
    };
    created_at: string;
  };
  schema: string;
  old_record: null | any;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } });
  }

  try {
    const payload: OrderWebhookPayload = await req.json();
    const order = payload.record;

    if (!order || !order.customer_email) {
      return new Response(JSON.stringify({ error: 'Invalid payload' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Only process new inserts
    if (payload.type !== 'INSERT') {
      return new Response(JSON.stringify({ message: 'Not an INSERT event' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log(`Sending email for order ${order.id} to ${order.customer_email}`);

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'objednavky@drinkboostup.cz',
        to: order.customer_email,
        subject: `Potvrzení objednávky #${order.id} - BoostUp Energy`,
        html: `
          <div style="font-family: 'Inter', system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa; padding: 48px 20px;">
            <div style="background-color: #ffffff; border-radius: 32px; padding: 48px 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.03);">
              <div style="text-align: center; margin-bottom: 32px;">
                <img src="cid:logo" alt="BoostUp" style="width: 200px; height: auto;">
              </div>
              
              <h1 style="color: #3a572c; font-size: 24px; font-weight: 700; margin-bottom: 16px; text-align: center;">Děkujeme za objednávku! 🚀</h1>
              <p style="color: #4b5563; text-align: center; margin-bottom: 32px; font-size: 16px;">Dobrý den, ${order.delivery_info?.firstName || order.customer_name}, Vaše objednávka <strong>#${order.id}</strong> byla úspěšně přijata.</p>
              
              <div style="background-color: #f8f9fa; border-radius: 20px; padding: 24px; margin-bottom: 32px;">
                <h2 style="color: #1a1a1a; font-size: 18px; font-weight: 600; margin: 0 0 16px 0;">Shrnutí objednávky</h2>
                <table style="width: 100%; border-collapse: collapse;">
                  <tbody>
                    ${order.items.map((item: any) => `
                      <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                          <div style="color: #1a1a1a; font-weight: 500;">${item.name}</div>
                          <div style="color: #6b7280; font-size: 14px;">Množství: ${item.quantity}x</div>
                        </td>
                        <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; text-align: right; color: #1a1a1a; font-weight: 600;">
                          ${item.price * item.quantity} Kč
                        </td>
                      </tr>
                    `).join('')}
                    <tr>
                      <td style="padding: 16px 0 8px 0; color: #4b5563;">Doprava (${order.delivery_info?.deliveryMethod === 'zasilkovna' ? 'Zásilkovna' : 'Standard'}):</td>
                      <td style="padding: 16px 0 8px 0; text-align: right; color: #1a1a1a; font-weight: 600;">
                        ${order.delivery_info?.deliveryMethod === 'zasilkovna' ? '79 Kč' : 'Zdarma'}
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #1a1a1a; font-weight: 700; font-size: 18px;">Celkem:</td>
                      <td style="padding: 8px 0; text-align: right; color: #3a572c; font-weight: 700; font-size: 20px;">
                        ${order.total} Kč
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div style="margin-bottom: 32px;">
                <h2 style="color: #1a1a1a; font-size: 18px; font-weight: 600; margin-bottom: 16px;">Doručovací údaje</h2>
                <p style="color: #4b5563; line-height: 1.6; margin: 0; font-size: 15px;">
                  <strong>Jméno:</strong> ${order.delivery_info?.firstName} ${order.delivery_info?.lastName}<br>
                  <strong>Adresa:</strong> ${order.delivery_info?.street}, ${order.delivery_info?.city}, ${order.delivery_info?.zip}<br>
                  <strong>Telefon:</strong> ${order.delivery_info?.phone}<br>
                  <strong>Způsob platby:</strong> ${order.delivery_info?.paymentMethod === 'transfer' ? 'Bankovní převod' : 'Kartou online'}
                </p>
              </div>
              
              ${order.delivery_info?.paymentMethod === 'transfer' ? `
                  <div style="background-color: #3a572c; color: white; padding: 32px; border-radius: 20px; margin-top: 24px;">
                      <h3 style="margin: 0 0 16px 0; font-size: 18px; text-align: center;">💲 Platební údaje pro převod</h3>
                      <p style="margin: 0 0 24px 0; font-size: 15px; text-align: center; opacity: 0.9;">
                        Číslo účtu: <strong style="color: white;">2102766861/2010</strong><br>
                        Variabilní symbol: <strong style="color: white;">${order.id.replace(/\D/g, '')}</strong><br>
                        Částka: <strong style="color: white;">${order.total} Kč</strong>
                      </p>
                      
                      <div style="text-align: center; background-color: white; padding: 20px; border-radius: 16px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                          <img src="http://api.paylibo.com/paylibo/generator/image?accountNumber=2102766861&bankCode=2010&amount=${order.total}&currency=CZK&vs=${order.id.replace(/\D/g, '')}" alt="QR Platba" style="max-width: 150px;">
                          <p style="font-size: 12px; color: #666; margin-top: 12px; margin-bottom: 0;">Naskenujte QR kód ve svém bankovnictví</p>
                      </div>
                      <p style="margin: 24px 0 0 0; font-size: 14px; text-align: center; opacity: 0.9;">Zboží odešleme ihned po připsání platby.</p>
                  </div>
              ` : ''}
            </div>

            <div style="margin-top: 32px; text-align: center; font-size: 14px; color: #6b7280;">
                <p style="margin: 0 0 12px 0;">BoostUp &middot; Chaloupkova 3002/1a &middot; 612 00 Brno</p>
                <p style="margin: 0;">
                    <a href="https://test.drinkboostup.cz" style="color: #3a572c; text-decoration: none; font-weight: bold;">drinkboostup.cz</a>
                    &nbsp;&nbsp;&middot;&nbsp;&nbsp;
                    <a href="mailto:info@drinkboostup.cz" style="color: #3a572c; text-decoration: none;">info@drinkboostup.cz</a>
                </p>
                <p style="color: #4b5563; font-weight: 600; margin-top: 24px;">S pozdravem, Tým BoostUp Energy</p>
            </div>
          </div>
        `,
        attachments: [
          {
            content: LOGO_BASE64,
            filename: 'logo.png',
            type: 'image/png',
            disposition: 'inline',
            contentId: 'logo'
          }
        ]
      }),
    });

    const data = await res.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

serve(handler);
