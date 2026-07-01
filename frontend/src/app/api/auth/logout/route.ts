import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully.'
    });

    // Clear access and refresh token cookies
    response.cookies.delete('access_token');
    
    // Refresh token path is restricted, so we must explicitly point to it to clear it
    response.cookies.set('refresh_token', '', {
      path: '/api/auth/refresh',
      maxAge: 0
    });

    return response;
  } catch (err) {
    return NextResponse.json(
      { success: false, message: 'Logout failed.' },
      { status: 500 }
    );
  }
}
