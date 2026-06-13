import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { data: products, error } = await supabaseAdmin
            .from('products')
            .select('sku, name, description, price, in_stock');

        if (error) throw error;

        const baseUrl = 'https://www.drinkboostup.cz';
        const fallbackDesc = 'BoostUp je revoluční energetický shot z přírodních extraktů. Získejte 6 hodin soustředění bez nervozity a crash efektu.';

        let xml = `<?xml version="1.0" encoding="utf-8"?>\n`;
        xml += `<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">\n`;
        xml += `<channel>\n`;
        xml += `  <title>BoostUp</title>\n`;
        xml += `  <link>${baseUrl}</link>\n`;
        xml += `  <description>Přírodní energetický shot</description>\n`;

        for (const product of products || []) {
            if (!product.sku) continue;
            
            const availability = product.in_stock ? 'in_stock' : 'out_of_stock';

            xml += `  <item>\n`;
            xml += `    <g:id>${product.sku}</g:id>\n`;
            xml += `    <g:title>${product.name || 'BoostUp Pure Shot 60ml'}</g:title>\n`;
            xml += `    <g:description>${product.description || fallbackDesc}</g:description>\n`;
            xml += `    <g:link>${baseUrl}/?sku=${product.sku}</g:link>\n`;
            xml += `    <g:image_link>${baseUrl}/og-image.jpg</g:image_link>\n`;
            xml += `    <g:condition>new</g:condition>\n`;
            xml += `    <g:availability>${availability}</g:availability>\n`;
            xml += `    <g:price>${product.price || 59} CZK</g:price>\n`;
            xml += `    <g:brand>BoostUp</g:brand>\n`;
            xml += `  </item>\n`;
        }

        xml += `</channel>\n`;
        xml += `</rss>`;

        res.setHeader('Content-Type', 'application/xml; charset=utf-8');
        res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=1800');
        return res.status(200).send(xml);

    } catch (error) {
        console.error('Unhandled error generating Google feed:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
