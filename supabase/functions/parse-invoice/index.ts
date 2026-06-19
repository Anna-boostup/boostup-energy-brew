import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { text, image_base64, mime_type } = await req.json();

        if (!text && !image_base64) {
            return new Response(JSON.stringify({ error: 'No text or image provided' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        // Connect to Supabase
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
        const supabase = createClient(supabaseUrl, supabaseKey);

        const { data: settings, error: settingsError } = await supabase.rpc('get_decrypted_ai_settings');
        if (settingsError) {
            console.error("Could not fetch AI settings:", settingsError);
        }

        const provider = settings?.active_ai_provider || 'openai';
        let parsedItems: any[] = [];

        const systemPrompt = `Jsi asistent pro vytěžování dat z faktur. Tvým úkolem je najít na faktuře seznam položek (surovin, materiálů), jejich množství a měrné jednotky. Vrať čistě JSON pole s objekty typu: { "name": "název suroviny", "quantity": číslo, "unit": "kg/ks/l..." }. Nepiš žádný text kolem, pouze platný JSON s kořenovým prvkem "items". Vždy použij desetinnou tečku u quantity.`;

        if (provider === 'openai') {
            const apiKey = settings?.openai_key || Deno.env.get('OPENAI_API_KEY');
            if (!apiKey) throw new Error('OpenAI API key is missing');

            let model = 'gpt-4o-mini';
            const messages: any[] = [{ role: 'system', content: systemPrompt }];

            if (text) {
                messages.push({ role: 'user', content: `Extrahuj položky z následujícího textu faktury:\n\n${text}` });
            } else if (image_base64 && mime_type) {
                model = 'gpt-4o'; 
                messages.push({
                    role: 'user',
                    content: [
                        { type: "text", text: "Extrahuj položky z této faktury:" },
                        { type: "image_url", image_url: { url: `data:${mime_type};base64,${image_base64}` } }
                    ]
                });
            }

            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model,
                    response_format: { type: "json_object" },
                    messages
                }),
            });

            if (!response.ok) throw new Error(`OpenAI API Error: ${await response.text()}`);
            const data = await response.json();
            const content = data.choices[0].message.content;
            const parsed = JSON.parse(content);
            parsedItems = parsed.items || [];

        } else if (provider === 'gemini') {
            const apiKey = settings?.gemini_key || Deno.env.get('GEMINI_API_KEY');
            if (!apiKey) throw new Error('Google Gemini API key is missing');

            const model = (image_base64 && mime_type) ? 'gemini-1.5-pro' : 'gemini-1.5-flash';
            const contents: any[] = [];
            
            if (text) {
                contents.push({ role: 'user', parts: [{ text: systemPrompt + '\n\nText faktury:\n' + text }] });
            } else if (image_base64 && mime_type) {
                contents.push({
                    role: 'user',
                    parts: [
                        { text: systemPrompt + '\n\nFaktura v příloze.' },
                        { inline_data: { mime_type, data: image_base64 } }
                    ]
                });
            }

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    contents,
                    generationConfig: { responseMimeType: "application/json" }
                }),
            });

            if (!response.ok) throw new Error(`Gemini API Error: ${await response.text()}`);
            const data = await response.json();
            const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
            const parsed = JSON.parse(textResponse);
            parsedItems = parsed.items || [];

        } else if (provider === 'anthropic') {
            const apiKey = settings?.anthropic_key || Deno.env.get('ANTHROPIC_API_KEY');
            if (!apiKey) throw new Error('Anthropic API key is missing');

            const model = 'claude-3-5-sonnet-20240620';
            const messages: any[] = [];
            
            if (text) {
                messages.push({ role: 'user', content: `Text faktury k vyčtení:\n\n${text}` });
            } else if (image_base64 && mime_type) {
                messages.push({
                    role: 'user',
                    content: [
                        { type: 'image', source: { type: 'base64', media_type: mime_type, data: image_base64 } },
                        { type: 'text', text: 'Zpracuj tuto fakturu a vyhledej položky podle instrukcí.' }
                    ]
                });
            }

            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model,
                    max_tokens: 4000,
                    system: systemPrompt,
                    messages
                })
            });

            if (!response.ok) throw new Error(`Anthropic API Error: ${await response.text()}`);
            const data = await response.json();
            const textResponse = data.content?.[0]?.text || '{}';
            // Anthropic doesn't have strict JSON mode yet, so we manually clean it just in case
            const cleaned = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(cleaned);
            parsedItems = parsed.items || [];
        }

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
