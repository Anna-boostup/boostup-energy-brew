/**
 * Vercel Middleware
 * 
 * Disabled Basic Authentication for all deployments.
 * All versions are now publicly accessible.
 */

export const config = {
    // Apply middleware to all paths except static assets
    matcher: '/((?!api|_next/static|_next/image|favicon.ico|assets).*)',
};

export default function middleware(request: Request) {
    // Authentication is currently disabled as per user request.
    // Making all environments publicly accessible.
    return new Response(null, {
        headers: { 'x-middleware-next': '1' }
    });
}
