import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully.'
    });

    // Clear access and refresh token cookies
    response.cookies.delete('access_token');
    response.cookies.delete('admin_access_token');
    response.cookies.delete('pending_otp_mobile');
    
    // Refresh token paths are restricted, explicitly clear both Next.js and backend paths
    response.cookies.set('refresh_token', '', {
      path: '/api/auth/refresh',
      maxAge: 0
    });
    response.cookies.set('refreshToken', '', {
      path: '/api/v1/auth/refresh',
      maxAge: 0
    });
    response.cookies.set('refreshToken', '', {
      path: '/',
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
