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

async function getAccessToken(clientId: string, clientSecret: string, isSandbox: boolean) {
    const baseUrl = isSandbox ? GOPAY_URL_SANDBOX : GOPAY_URL_PROD;
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

        const isSandbox = true; // Hardcoded for now, should use process.env.NODE_ENV or GOPAY_ENV
        const baseUrl = isSandbox ? GOPAY_URL_SANDBOX : GOPAY_URL_PROD;
        
        const goId = process.env.GOPAY_GOID || '8738112812';
        const clientId = process.env.GOPAY_CLIENT_ID || '1151077928';
        const clientSecret = process.env.GOPAY_CLIENT_SECRET || 'cxcvevfZ';

        console.log(`[GoPay] Creating payment for order ${orderNumber}`);

        const tokenData = await getAccessToken(clientId, clientSecret, isSandbox);
        const accessToken = tokenData.access_token;

        const origin = req.headers.get('origin') || 'https://test.drinkboostup.cz';

        // Prepare MINIMAL GoPay payment data to isolate the error
        const paymentData: any = {
            target: {
                type: 'ACCOUNT',
                goid: goId
            },
            amount: Math.round(total * 100), // in cents/haléře
            currency: 'CZK',
            order_number: orderNumber,
            order_description: `Objednávka ${orderNumber}`,
            callback: {
                return_url: `${origin}/payment/success?orderNumber=${orderNumber}&amount=${total}&provider=gopay`,
                notification_url: `${origin}/api/gopay-webhook`
            },
            lang: 'cs'
        };

        // Only add payer if we have data
        if (customerEmail) {
            paymentData.payer = {
                contact: {
                    email: customerEmail,
                    full_name: customerName || customerEmail
                }
            };
        }

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
