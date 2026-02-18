
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

interface ProfileWebhookPayload {
    type: string;
    table: string;
    record: {
        id: string;
        email: string;
        full_name: string;
        role: string;
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
        const payload: ProfileWebhookPayload = await req.json();
        const profile = payload.record;

        if (!profile || !profile.email) {
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

        console.log(`Sending welcome email to ${profile.email}`);

        const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
                from: 'info@drinkboostup.cz', // Using info@ for welcome emails
                to: profile.email,
                subject: `Vítejte v týmu BoostUp! 🚀`,
                html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #1a1a1a;">Vítejte, ${profile.full_name || 'energií nabitý příteli'}! 👋</h1>
            
            <p style="color: #4b5563; line-height: 1.6; font-size: 16px;">
              Děkujeme za registraci na <strong>BoostUp Energy</strong>. Jsme moc rádi, že jste s námi.
            </p>

            <p style="color: #4b5563; line-height: 1.6; font-size: 16px;">
              Váš účet je nyní aktivní. Můžete:
            </p>
            
            <ul style="color: #4b5563; line-height: 1.6; font-size: 16px;">
                <li>🚀 Rychleji nakupovat (údaje už máme).</li>
                <li>📦 Sledovat stav svých objednávek.</li>
                <li>⭐ Hodnotit produkty.</li>
            </ul>

            <div style="margin-top: 30px; text-align: center;">
                <a href="https://boostup.cz/products" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                    Jít nakupovat energii
                </a>
            </div>

            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 40px 0;">

            <p style="color: #6b7280; font-size: 14px; text-align: center;">
              Máte dotaz? Odpovězte na tento e-mail, rádi pomůžeme.<br>
              <a href="mailto:info@drinkboostup.cz" style="color: #2563eb; text-decoration: none;">info@drinkboostup.cz</a>
            </p>
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
