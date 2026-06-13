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
        const fallbackDesc = 'BoostUp je revoluční energetický shot z přírodních extraktů. Získejte 6 hodin soustředění bez nervozity a crash efektu. Pure Shot 60ml s elektrolyty a nootropiky.';

        let xml = `<?xml version="1.0" encoding="utf-8"?>\n`;
        xml += `<SHOP>\n`;

        for (const product of products || []) {
            // Avoid generating feeds for non-main products if any exist without SKU
            if (!product.sku) continue;
            
            // Map pack sizes directly from SKU or Name to categorize (e.g. 3-pack, 12-pack)
            const deliveryDays = product.in_stock ? '0' : '7';

            xml += `  <SHOPITEM>\n`;
            xml += `    <ITEM_ID>${product.sku}</ITEM_ID>\n`;
            xml += `    <PRODUCTNAME>${product.name || 'BoostUp Pure Shot 60ml'}</PRODUCTNAME>\n`;
            xml += `    <PRODUCT>${product.name || 'BoostUp Pure Shot 60ml'} - Přírodní energetický nápoj</PRODUCT>\n`;
            xml += `    <DESCRIPTION>${product.description || fallbackDesc}</DESCRIPTION>\n`;
            xml += `    <URL>${baseUrl}/?sku=${product.sku}</URL>\n`;
            xml += `    <IMGURL>${baseUrl}/og-image.jpg</IMGURL>\n`;
            xml += `    <PRICE_VAT>${product.price || 59}</PRICE_VAT>\n`;
            xml += `    <MANUFACTURER>BoostUp</MANUFACTURER>\n`;
            xml += `    <CATEGORYTEXT>Jídlo a nápoje | Nápoje | Energetické nápoje</CATEGORYTEXT>\n`;
            xml += `    <DELIVERY_DATE>${deliveryDays}</DELIVERY_DATE>\n`;
            xml += `  </SHOPITEM>\n`;
        }

        xml += `</SHOP>`;

        res.setHeader('Content-Type', 'application/xml; charset=utf-8');
        res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=1800');
        return res.status(200).send(xml);

    } catch (error) {
        console.error('Unhandled error generating Heureka feed:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
