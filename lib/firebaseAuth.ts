import { NextRequest, NextResponse } from 'next/server';

// Extract token from request
export function extractTokenFromRequest(request: NextRequest): string | null {
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

// Middleware function to protect routes
export async function protectRoute(request: NextRequest) {
  const token = extractTokenFromRequest(request);
  
  if (!token) {
    return NextResponse.json(
      { error: 'No authentication token provided' },
      { status: 401 }
    );
  }

  // Token verification will be handled in API routes using firebaseAdmin.ts
  return { token };
}

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/sign-in',
  '/sign-up',
  '/login',
  '/api/auth',
];

// Check if route is public
export function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some(route => {
    if (route === '/') return pathname === '/';
    return pathname.startsWith(route);
  });
}
