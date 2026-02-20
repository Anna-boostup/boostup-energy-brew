import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Vercel Middleware for Basic Authentication
 * 
 * This middleware secures non-production deployments (Preview and Development)
 * while allowing public access to the production domain.
 */

export const config = {
    // Apply middleware to all paths
    matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
};

export default function middleware(request: NextRequest) {
    const hostname = request.headers.get('host') || '';

    // 1. Configuration from Environment Variables
    // Note: These must be set in Vercel Project Settings -> Environment Variables
    const authUser = process.env.AUTH_USER;
    const authPass = process.env.AUTH_PASS;
    const productionDomain = process.env.PRODUCTION_DOMAIN;

    // 2. Bypass Logic
    // Bypass if:
    // - No authentication is configured
    // - Current hostname matches the production domain
    // - Current hostname is localhost (for local development)
    if (
        !authUser ||
        !authPass ||
        (productionDomain && hostname.includes(productionDomain)) ||
        hostname.includes('localhost') ||
        hostname.includes('127.0.0.1')
    ) {
        return NextResponse.next();
    }

    // 3. Basic Auth Verification
    const authHeader = request.headers.get('authorization');

    if (authHeader) {
        try {
            const authValue = authHeader.split(' ')[1];
            const decoded = atob(authValue);
            const [user, pwd] = decoded.split(':');

            if (user === authUser && pwd === authPass) {
                return NextResponse.next();
            }
        } catch (e) {
            console.error('Failed to decode Auth Header', e);
        }
    }

    // 4. Return 401 Unauthorized if auth fails
    return new NextResponse('Authentication Required', {
        status: 401,
        headers: {
            'WWW-Authenticate': 'Basic realm="Secure Area"',
        },
    });
}
