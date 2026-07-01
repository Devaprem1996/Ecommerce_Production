import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json({
      success: true,
      message: 'Admin logged out successfully.'
    });

    // Clear authentication cookies
    response.cookies.delete('access_token');
    
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
