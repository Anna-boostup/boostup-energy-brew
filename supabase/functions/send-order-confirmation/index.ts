
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

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
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h1>Děkujeme za objednávku! 🚀</h1>
            <p>Dobrý den, ${order.delivery_info?.firstName || order.customer_name},</p>
            <p>Vaše objednávka <strong>#${order.id}</strong> byla úspěšně přijata a zpracováváme ji.</p>
            
            <h2>Shrnutí objednávky</h2>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <thead style="background-color: #f3f4f6;">
                <tr>
                  <th style="padding: 10px; text-align: left;">Produkt</th>
                  <th style="padding: 10px; text-align: right;">Množství</th>
                  <th style="padding: 10px; text-align: right;">Cena</th>
                </tr>
              </thead>
              <tbody>
                ${order.items.map((item: any) => `
                  <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${item.quantity}x</td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${item.price * item.quantity} Kč</td>
                  </tr>
                `).join('')}
              </tbody>
              <tfoot>
                <tr>
                    <td colspan="2" style="padding: 10px; text-align: right; font-weight: bold;">Doprava (${order.delivery_info?.deliveryMethod === 'zasilkovna' ? 'Zásilkovna' : 'Standard'}):</td>
                    <td style="padding: 10px; text-align: right; font-weight: bold;">${order.delivery_info?.deliveryMethod === 'zasilkovna' ? '79 Kč' : 'Zdarma'}</td>
                </tr>
                <tr>
                  <td colspan="2" style="padding: 10px; text-align: right; font-weight: bold; font-size: 1.2em;">Celkem:</td>
                  <td style="padding: 10px; text-align: right; font-weight: bold; font-size: 1.2em;">${order.total} Kč</td>
                </tr>
              </tfoot>
            </table>

            <h2>Doručovací údaje</h2>
            <p>
              <strong>Jméno:</strong> ${order.delivery_info?.firstName} ${order.delivery_info?.lastName}<br>
              <strong>Adresa:</strong> ${order.delivery_info?.street}, ${order.delivery_info?.city}, ${order.delivery_info?.zip}<br>
              <strong>Telefon:</strong> ${order.delivery_info?.phone}<br>
              <strong>Způsob platby:</strong> ${order.delivery_info?.paymentMethod === 'transfer' ? 'Bankovní převod' : 'Kartou online'}
            </p>
            
            ${order.delivery_info?.paymentMethod === 'transfer' ? `
                <div style="background-color: #eef2ff; padding: 15px; border-radius: 8px; margin-top: 20px;">
                    <h3 style="margin-top: 0;">💲 Platební údaje pro převod</h3>
                    <p>Číslo účtu: <strong>2102766861/2010</strong> (Fio banka)<br>
                    Variabilní symbol: <strong>${order.id.replace(/\D/g, '')}</strong> (nebo číslo objednávky bez ORD-)<br>
                    Částka: <strong>${order.total} Kč</strong></p>
                    <p>Zboží odešleme ihned po připsání platby.</p>
                </div>
            ` : ''}

            <p style="margin-top: 30px; color: #666; font-size: 0.9em;">
              Pokud máte jakékoliv dotazy, neváhejte nás kontaktovat na <a href="mailto:info@drinkboostup.cz">info@drinkboostup.cz</a>.
            </p>
            
            <p>S pozdravem,<br>Tým BoostUp Energy</p>
          </div>
        `,
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
