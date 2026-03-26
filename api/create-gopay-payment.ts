import { v4 as uuidv4 } from 'uuid';

// GoPay API URLs
const GOPAY_URL_SANDBOX = 'https://gw.sandbox.gopay.com/api';
const GOPAY_URL_PROD = 'https://gate.gopay.cz/api';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export const config = {
    runtime: 'edge',
};

async function getAccessToken(clientId: string, clientSecret: string, baseUrl: string) {
    const auth = btoa(`${clientId}:${clientSecret}`);

    const response = await fetch(`${baseUrl}/oauth2/token`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${auth}`
        },
        body: 'grant_type=client_credentials&scope=payment-all'
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error_description || 'Failed to obtain GoPay access token');
    }

    return await response.json();
}

export default async function handler(req: Request) {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    if (req.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
    }

    try {
        const body = await req.json();
        const { orderNumber, total, customerEmail, customerName, items } = body;
        
        console.log('[ENV Check]', { goId: process.env.GOPAY_GO_ID });
        console.log('[GoPay Debug]', { customerName, customerEmail });

        // Use GOPAY_API_URL from env if set, fall back to production gateway
        const baseUrl = (process.env.GOPAY_API_URL || 'https://gate.gopay.cz/api').replace(/\/$/, '');

        const goId = process.env.GOPAY_GO_ID;
        const clientId = process.env.GOPAY_CLIENT_ID;
        const clientSecret = process.env.GOPAY_CLIENT_SECRET;

        console.log(`[GoPay] Creating payment for order ${orderNumber}, baseUrl: ${baseUrl}`);

        const tokenData = await getAccessToken(clientId!, clientSecret!, baseUrl);
        console.log('[GoPay Token Response]', JSON.stringify(tokenData));
        const accessToken = tokenData.access_token;

        const origin = req.headers.get('origin') || 'https://test.drinkboostup.cz';

        // NOTE: target omitted — the one payment that reached GoPay (ID 3297672027) had no target.
        // With target, sandbox consistently returns go_id: INVALID despite correct GoID.
        const paymentData: any = {
            target: {
                type: 'ACCOUNT',
                goid: Number(goId)  // GoPay npm SDK uses 'goid' (no underscore)
            },
            payer: {
                default_payment_instrument: 'PAYMENT_CARD',
                allowed_payment_instruments: ['PAYMENT_CARD', 'BANK_ACCOUNT']
            },
            amount: Math.round(total * 100),
            currency: 'CZK',
            order_number: orderNumber,
            order_description: `Objednavka ${orderNumber}`,
            items: [
                ...items.map((item: any) => ({
                    name: item.name.replace(/[^\x00-\xFF\u0100-\u017F]/g, '').trim(),
                    amount: Math.round(item.price * item.quantity * 100),
                    count: item.quantity
                })),
                ...(total > items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0) ? [{
                    name: 'Doprava',
                    amount: Math.round((total - items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0)) * 100),
                    count: 1
                }] : [])
            ],
            callback: {
                return_url: `${origin}/payment/success?orderNumber=${orderNumber}&amount=${total}&provider=gopay`,
                notification_url: `${origin}/api/gopay-webhook`
            },
            lang: 'CS'
        };

        console.log(`[GoPay Data Check] Total Amount: ${paymentData.amount}`);

        console.log(`[GoPay Full Request Payload]:`, JSON.stringify(paymentData, null, 2));

        const response = await fetch(`${baseUrl}/payments/payment`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(paymentData)
        });

        const data = await response.json();
        console.log(`[GoPay Full Response]:`, JSON.stringify(data, null, 2));

        if (!response.ok) {
            console.error('[GoPay Error Response]', data);
            // Return full error details to frontend for debugging
            return new Response(JSON.stringify({ 
                error: `GoPay Error: ${JSON.stringify(data)}` 
            }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        return new Response(JSON.stringify({ 
            gw_url: data.gw_url,
            paymentId: data.id 
        }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (error: any) {
        console.error('[GoPay Backend Error]', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
}
