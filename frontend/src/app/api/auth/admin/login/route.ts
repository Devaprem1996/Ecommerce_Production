import { NextRequest, NextResponse } from 'next/server';
import { signToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required.' },
        { status: 400 }
      );
    }

    // Default admin mock credentials
    const validEmail = 'admin@aether.com';
    const validPassword = 'Password123';

    if (email.toLowerCase() !== validEmail || password !== validPassword) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    const secret = process.env.JWT_SECRET || 'default_jwt_secret_change_me_in_prod';

    const adminPayload = {
      id: 'adm_aether_super',
      name: 'Aether Administrator',
      mobile: '9876543210',
      email: email.toLowerCase(),
      avatar: null,
      role: 'admin' as const,
      language: 'en' as const,
      isVerified: true,
      createdAt: new Date().toISOString()
    };

    // Sign Access Token (15 mins) and Refresh Token (24 hours for Admin)
    const accessToken = signToken(adminPayload, secret, 15);
    const refreshToken = signToken(adminPayload, secret, 24 * 60);

    const response = NextResponse.json({
      success: true,
      message: 'Admin logged in successfully.',
      user: adminPayload,
      accessToken
    });

    const isProduction = process.env.NODE_ENV === 'production';

    // Set access token cookie
    response.cookies.set('access_token', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60 // 15 minutes
    });

    // Set admin refresh token cookie (24 hours expiration)
    response.cookies.set('refresh_token', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      path: '/api/auth/refresh',
      maxAge: 24 * 60 * 60 // 24 hours
    });

    return response;
  } catch (err) {
    return NextResponse.json(
      { success: false, message: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
