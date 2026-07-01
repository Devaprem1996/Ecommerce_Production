import { NextRequest, NextResponse } from 'next/server';
import { signToken, JWTPayload } from '@/lib/auth';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { otp, name, email, language } = body;

    const pendingMobileCookie = request.cookies.get('pending_otp_mobile');
    const mobile = pendingMobileCookie?.value;

    if (!mobile) {
      return NextResponse.json(
        { success: false, message: 'OTP expired. Please request a new one' },
        { status: 400 }
      );
    }

    if (!otp || otp !== '123456') {
      return NextResponse.json(
        { success: false, message: 'Incorrect OTP. Please try again.' },
        { status: 400 }
      );
    }

    const secret = process.env.JWT_SECRET || 'default_jwt_secret_change_me_in_prod';

    // Mock customer payload
    const userPayload: Omit<JWTPayload, 'exp'> = {
      id: `usr_${crypto.randomUUID().substring(0, 8)}`,
      name: name || 'Aether Customer',
      mobile: mobile,
      email: email || null,
      avatar: null,
      role: 'customer',
      language: language === 'ta' ? 'ta' : 'en',
      isVerified: true,
      createdAt: new Date().toISOString()
    };

    // Sign Access Token (15 mins) and Refresh Token (7 days)
    const accessToken = signToken(userPayload, secret, 15);
    const refreshToken = signToken(userPayload, secret, 7 * 24 * 60);

    const response = NextResponse.json({
      success: true,
      message: 'OTP verified successfully.',
      user: userPayload,
      accessToken
    });

    const isProduction = process.env.NODE_ENV === 'production';

    // Write access token cookie for middleware/SSR page access
    response.cookies.set('access_token', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60 // 15 minutes
    });

    // Write refresh token cookie restricted to the refresh path for maximum security
    response.cookies.set('refresh_token', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      path: '/api/auth/refresh',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    // Remove temporary mobile verification cookie
    response.cookies.delete('pending_otp_mobile');

    return response;
  } catch (err) {
    return NextResponse.json(
      { success: false, message: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
