import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, signToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const refreshTokenCookie = request.cookies.get('refresh_token');
    const refreshToken = refreshTokenCookie?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, message: 'No refresh token provided.' },
        { status: 401 }
      );
    }

    const secret = process.env.JWT_SECRET || 'default_jwt_secret_change_me_in_prod';
    const decoded = verifyToken(refreshToken, secret);

    if (!decoded) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired session. Please login again.' },
        { status: 401 }
      );
    }

    // Generate new Access Token (15 mins)
    const userPayload = {
      id: decoded.id,
      name: decoded.name,
      mobile: decoded.mobile,
      email: decoded.email,
      avatar: decoded.avatar,
      role: decoded.role,
      language: decoded.language,
      isVerified: decoded.isVerified,
      createdAt: decoded.createdAt
    };

    const newAccessToken = signToken(userPayload, secret, 15);

    const response = NextResponse.json({
      success: true,
      accessToken: newAccessToken,
      user: userPayload
    });

    // Update access token cookie
    response.cookies.set('access_token', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60 // 15 minutes
    });

    return response;
  } catch (err) {
    return NextResponse.json(
      { success: false, message: 'Session refresh failed.' },
      { status: 500 }
    );
  }
}
