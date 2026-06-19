import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { text, image_base64, mime_type } = await req.json();

        if (!text && !image_base64) {
            return new Response(JSON.stringify({ error: 'No text or image provided' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
        
        if (!OPENAI_API_KEY) {
             throw new Error('OpenAI API key is missing in Supabase Secrets');
        }

        const messages: any[] = [
            {
                role: 'system',
                content: `Jsi asistent pro vytěžování dat z faktur. Tvým úkolem je najít na faktuře seznam položek (surovin, materiálů), jejich množství a měrné jednotky. Vrať čistě JSON pole s objekty typu: { "name": "název suroviny", "quantity": číslo, "unit": "kg/ks/l..." }. Nepiš žádný text kolem, pouze platný JSON s kořenovým prvkem "items".`
            }
        ];

        let model = 'gpt-4o-mini';

        if (text) {
            messages.push({
                role: 'user',
                content: `Extrahuj položky z následujícího textu faktury:\n\n${text}`
            });
        } else if (image_base64 && mime_type) {
            model = 'gpt-4o'; // Použijeme plný gpt-4o pro obrázky
            messages.push({
                role: 'user',
                content: [
                    { type: "text", text: "Extrahuj položky z této faktury:" },
                    {
                        type: "image_url",
                        image_url: {
                            url: `data:${mime_type};base64,${image_base64}`
                        }
                    }
                ]
            });
        }

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: model,
                response_format: { type: "json_object" },
                messages: messages
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('OpenAI Error:', error);
            throw new Error(`OpenAI API responded with status ${response.status}`);
        }

        const data = await response.json();
        const content = data.choices[0].message.content;
        
        const parsedContent = JSON.parse(content);
        const parsedItems = parsedContent.items || [];

        return new Response(JSON.stringify({ items: parsedItems }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (error: any) {
        console.error('Error in parse-invoice:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
