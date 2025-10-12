import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = NextResponse.json({ success: true });
    
    // Clear the Firebase token cookie
    response.cookies.set('firebase-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Error clearing auth token:', error);
    return NextResponse.json({ error: 'Failed to clear token' }, { status: 500 });
  }
}
