import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

let ratelimit: Ratelimit | null = null;

// Podpora pro novou integraci Upstash i starší Vercel KV
const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

if (url && token) {
    const redis = new Redis({
        url: url,
        token: token,
    });

    // Povolí maximálně 10 requestů za minutu z jedné IP adresy na jeden endpoint
    ratelimit = new Ratelimit({
        redis: redis,
        limiter: Ratelimit.slidingWindow(10, '1 m'),
        analytics: true,
    });
}

export async function checkRateLimit(req: any, identifierPrefix: string = 'api'): Promise<{ success: boolean }> {
    if (!ratelimit) {
        // Pokud ještě Redis není naklikaný ve Vercelu, propustíme vše
        console.warn('[RateLimiter] Redis/KV env variables not found. Rate limiting is bypassed.');
        return { success: true };
    }

    let ip = '127.0.0.1';
    if (typeof req.headers?.get === 'function') {
        ip = req.headers.get('x-real-ip') ?? req.headers.get('x-forwarded-for') ?? '127.0.0.1';
    } else if (req.headers) {
        ip = (req.headers['x-real-ip'] as string) ?? (req.headers['x-forwarded-for'] as string) ?? '127.0.0.1';
    }
    
    // Some proxies send multiple IPs in x-forwarded-for, take the first one
    if (ip.includes(',')) {
        ip = ip.split(',')[0].trim();
    }

    const identifier = `${identifierPrefix}_${ip}`;
    
    const { success } = await ratelimit.limit(identifier);
    
    if (!success) {
        console.warn(`[RateLimiter] Rate limit exceeded for IP: ${ip} on endpoint: ${identifierPrefix}`);
    }

    return { success };
}
