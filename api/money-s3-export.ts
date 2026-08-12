import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Only allow GET (for Money S3 fetch) or POST (for manual triggers)
    if (req.method !== 'GET' && req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Support a simple security token in the URL
    const token = req.query.token || req.body?.token;
    const secureToken = process.env.MONEY_S3_TOKEN;

    // Fail-closed auth: if secureToken is not configured or doesn't match, return 401
    if (!secureToken || token !== secureToken) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    try {
        // Fetch orders from the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data: orders, error } = await supabase
            .from('orders')
            .select('*')
            .gte('created_at', thirtyDaysAgo.toISOString())
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).json({ error: 'Failed to fetch orders' });
        }

        // Generate XML
        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<MoneyData version="2.0">\n  <SeznamFaktVyst>\n`;

        for (const order of (orders || [])) {
            const date = new Date(order.created_at).toISOString().split('T')[0];
            const dueDate = new Date(new Date(order.created_at).getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

            xml += `    <FaktVyst>\n`;
            xml += `      <Doklad>${order.id}</Doklad>\n`;
            xml += `      <Popis>Objednávka z e-shopu č. ${order.id}</Popis>\n`;
            xml += `      <VarSymbol>${String(order.id).replace(/\D/g, '').slice(0, 10)}</VarSymbol>\n`;
            xml += `      <DatVyst>${date}</DatVyst>\n`;
            xml += `      <DatUctPrip>${date}</DatUctPrip>\n`;
            xml += `      <DatSpl>${dueDate}</DatSpl>\n`;
            xml += `      <Adresa>\n`;
            const di = order.delivery_info || {};
            const obchNazev = di.isCompany ? (di.companyName || order.customer_name) : order.customer_name;
            xml += `        <ObchNazev>${obchNazev || 'Anonymní zákazník'}</ObchNazev>\n`;
            xml += `        <Email>${order.customer_email || ''}</Email>\n`;
            xml += `        <Ulice>${`${di.street || ''} ${di.houseNumber || ''}`.trim()}</Ulice>\n`;
            xml += `        <Obec>${di.city || ''}</Obec>\n`;
            xml += `        <PSC>${di.zip || ''}</PSC>\n`;
            xml += `        <Stat>${di.country || 'Česká republika'}</Stat>\n`;
            xml += `      </Adresa>\n`;

            xml += `      <SeznamPolozek>\n`;
            const items = order.items || [];
            for (const item of items) {
                xml += `        <Polozka>\n`;
                xml += `          <Popis>${item.name}</Popis>\n`;
                xml += `          <PocetMJ>${item.quantity || 1}</PocetMJ>\n`;
                xml += `          <JednCena>${item.price || 0}</JednCena>\n`;
                xml += `          <SazbaDPH>21</SazbaDPH>\n`;
                xml += `        </Polozka>\n`;
            }
            xml += `      </SeznamPolozek>\n`;

            // Ceny jsou včetně DPH → základ = total/1.21, daň = total − základ (součet pak sedí na Celkem).
            const zaklad21 = Number(order.total) / 1.21;
            const dan21 = Number(order.total) - zaklad21;
            xml += `      <SouhrnDPH>\n`;
            xml += `        <Zaklad0>0</Zaklad0>\n`;
            xml += `        <Zaklad21>${zaklad21.toFixed(2)}</Zaklad21>\n`;
            xml += `        <Dan21>${dan21.toFixed(2)}</Dan21>\n`;
            xml += `      </SouhrnDPH>\n`;
            xml += `      <Celkem>${order.total}</Celkem>\n`;
            xml += `    </FaktVyst>\n`;
        }

        xml += `  </SeznamFaktVyst>\n</MoneyData>`;

        // Set content type to XML
        res.setHeader('Content-Type', 'application/xml');
        return res.status(200).send(xml);

    } catch (err) {
        console.error('Money S3 export error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
