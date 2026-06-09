// Edge serverless handler to proxy ARES queries to prevent CORS issues
export const config = {
    runtime: 'edge',
};

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export default async function handler(req: Request) {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    const { searchParams } = new URL(req.url);
    const ico = searchParams.get('ico');

    if (!ico) {
        return new Response(JSON.stringify({ error: 'Missing IČO parameter' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    // Clean IČO: remove spaces, check if it's 1-8 digits
    const cleanedIco = ico.replace(/\s/g, '');
    if (!/^\d{1,8}$/.test(cleanedIco)) {
        return new Response(JSON.stringify({ error: 'Neplatný formát IČO (musí obsahovat 1 až 8 číslic)' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    // Pad with leading zeros to 8 digits
    const paddedIco = cleanedIco.padStart(8, '0');

    try {
        console.log(`[ARES Edge] Fetching data for IČO: ${paddedIco}`);
        const url = `https://ares.gov.cz/ares/rest/ekonomicke-subjekty/${paddedIco}`;
        const response = await fetch(url, {
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'BoostUp-Energy-Brew-Invoicing/1.0'
            }
        });
        
        if (response.status === 404) {
            return new Response(JSON.stringify({ error: 'Subjekt nebyl v registru ARES nalezen' }), {
                status: 404,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        if (!response.ok) {
            throw new Error(`ARES API vrátilo stav ${response.status}`);
        }

        const data = await response.json();
        
        // Extract address details
        const sidlo = data.sidlo || {};
        const street = sidlo.nazevUlice || sidlo.nazevObce || '';
        const houseNum = sidlo.cisloDomovni || '';
        const orientNum = sidlo.cisloOrientacni || '';
        
        let houseNumber = '';
        if (houseNum && orientNum) {
            houseNumber = `${houseNum}/${orientNum}`;
        } else if (houseNum) {
            houseNumber = `${houseNum}`;
        } else if (orientNum) {
            houseNumber = `${orientNum}`;
        }

        const result = {
            companyName: data.obchodniJmeno || '',
            ico: data.ico || paddedIco,
            dic: data.dic || '',
            street: street,
            houseNumber: houseNumber,
            city: sidlo.nazevObce || '',
            zip: sidlo.psc ? sidlo.psc.toString() : ''
        };

        return new Response(JSON.stringify(result), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (error: any) {
        console.error('[ARES Edge Error]', error);
        return new Response(JSON.stringify({ error: error.message || 'Nepodařilo se připojit k registru ARES' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
}
