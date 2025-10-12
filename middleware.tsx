import { NextRequest, NextResponse } from 'next/server';

// Public routes that don't require authentication
const publicRoutes = [
    '/',
    '/app',
    '/sign-in',
    '/sign-up',
    '/login',
    '/api/auth',
];

// Protected routes that require authentication
const protectedRoutes = [
    '/api/user',
];

// Check if route is public
function isPublicRoute(pathname: string): boolean {
    return publicRoutes.some(route => {
        if (route === '/') return pathname === '/';
        return pathname.startsWith(route);
    });
}

// Check if route is protected
function isProtectedRoute(pathname: string): boolean {
    return protectedRoutes.some(route => {
        return pathname.startsWith(route);
    });
}

// Extract token from request
function extractTokenFromRequest(request: NextRequest): string | null {
    // Try to get token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }

    // Try to get token from cookies
    const token = request.cookies.get('firebase-token')?.value;
    if (token) {
        return token;
    }

    return null;
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Skip middleware for static files and Next.js internals
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api/auth') ||
        pathname.includes('.') ||
        pathname.startsWith('/favicon')
    ) {
        return NextResponse.next();
    }

    // Allow public routes (including the main website)
    if (isPublicRoute(pathname)) {
        return NextResponse.next();
    }

    // Only protect specific routes that actually need authentication
    if (isProtectedRoute(pathname)) {
        const token = extractTokenFromRequest(request);
        
        if (!token) {
            // Redirect to sign-in page for unauthenticated users trying to access protected routes
            const signInUrl = new URL('/sign-in', request.url);
            return NextResponse.redirect(signInUrl);
        }
    }

    // Allow all other routes to pass through
    return NextResponse.next();
}

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
}