import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Initialize Supabase Admin with fallback to anon key to prevent crash if service role key is missing
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const supabaseAdmin = createClient(
    supabaseUrl,
    supabaseKey,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

export default async function handler(
    req: VercelRequest,
    res: VercelResponse
) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Fetch all published blog posts
        const { data: posts, error } = await supabaseAdmin
            .from('blog_posts')
            .select('slug, updated_at, published_at')
            .eq('status', 'published');

        if (error) {
            console.error('Error fetching blog posts for sitemap:', error);
            // Don't fail the whole sitemap if blog posts fail, just return static routes
        }

        const staticRoutes = [
            { path: '', priority: '1.0', changefreq: 'weekly' },
            { path: '/blog', priority: '0.8', changefreq: 'daily' },
            { path: '/obchodni-podminky', priority: '0.5', changefreq: 'monthly' },
            { path: '/ochrana-osobnich-udaju', priority: '0.5', changefreq: 'monthly' },
            { path: '/reklamace', priority: '0.5', changefreq: 'monthly' },
            { path: '/cookies', priority: '0.5', changefreq: 'monthly' },
            { path: '/doprava-a-platba', priority: '0.5', changefreq: 'monthly' },
            { path: '/podminky-opakovane-platby', priority: '0.5', changefreq: 'monthly' },
        ];

        const baseUrl = 'https://www.drinkboostup.cz';
        const now = new Date().toISOString();

        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
        xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

        // Add static routes
        for (const route of staticRoutes) {
            xml += `  <url>\n`;
            xml += `    <loc>${baseUrl}${route.path}</loc>\n`;
            xml += `    <lastmod>${now}</lastmod>\n`;
            xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
            xml += `    <priority>${route.priority}</priority>\n`;
            xml += `  </url>\n`;
        }

        // Add dynamic blog posts
        if (posts && posts.length > 0) {
            for (const post of posts) {
                const lastMod = post.updated_at || post.published_at || now;
                xml += `  <url>\n`;
                xml += `    <loc>${baseUrl}/blog/${post.slug}</loc>\n`;
                xml += `    <lastmod>${lastMod}</lastmod>\n`;
                xml += `    <changefreq>monthly</changefreq>\n`;
                xml += `    <priority>0.7</priority>\n`;
                xml += `  </url>\n`;
            }
        }

        xml += `</urlset>`;

        // Set headers for XML and aggressive caching (24 hours on Vercel CDN)
        res.setHeader('Content-Type', 'application/xml');
        res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=43200');
        
        return res.status(200).send(xml);

    } catch (error) {
        console.error('Unhandled error generating sitemap:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
