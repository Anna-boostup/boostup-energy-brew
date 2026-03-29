/**
 * Vercel Middleware for Basic Authentication
 * 
 * This middleware secures non-production deployments (Preview and Development)
 * while allowing public access to the production domain.
 * Triggering redeploy.
 */

export const config = {
    // Apply middleware to all paths except static assets
    matcher: '/((?!api|_next/static|_next/image|favicon.ico|assets).*)',
};

export default function middleware(request: Request) {
    const url = new URL(request.url);
    const hostname = request.headers.get('host') || '';

    // 1. Configuration from Environment Variables
    const authUser = process.env.AUTH_USER;
    const authPass = process.env.AUTH_PASS;
    const productionDomain = process.env.PRODUCTION_DOMAIN;

    // 2. Bypass Logic
    if (
        !authUser ||
        !authPass ||
        (productionDomain && (hostname === productionDomain || hostname === `www.${productionDomain}`)) ||
        hostname === 'test.drinkboostup.cz' || // Temporary bypass for security audit
        hostname.includes('localhost') ||
        hostname.includes('127.0.0.1')
    ) {
        return new Response(null, {
            headers: { 'x-middleware-next': '1' }
        });
    }

    // 3. Basic Auth Verification
    const authHeader = request.headers.get('authorization');

    if (authHeader) {
        try {
            const authValue = authHeader.split(' ')[1];
            const decoded = atob(authValue);
            const [user, pwd] = decoded.split(':');

            if (user === authUser && pwd === authPass) {
                return new Response(null, {
                    headers: { 'x-middleware-next': '1' }
                });
            }
        } catch (e) {
            console.error('Failed to decode Auth Header', e);
        }
    }

    // 4. Return 401 Unauthorized if auth fails
    return new Response('Authentication Required', {
        status: 401,
        headers: {
            'WWW-Authenticate': 'Basic realm="Secure Area"',
        },
    });
}
