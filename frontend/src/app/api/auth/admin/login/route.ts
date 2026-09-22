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

    const normalizedEmail = email.toLowerCase().trim();
    const secret = process.env.JWT_SECRET || 'dev-secret-key-for-jwt-signing-tokens-123456';
    const backendApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

    // 1. Try real database authentication via Express backend
    try {
      const backendRes = await fetch(`${backendApiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail, password }),
      });

      if (backendRes.ok) {
        const backendJson = await backendRes.json();
        if (backendJson.success && backendJson.data?.user) {
          const backendUser = backendJson.data.user;
          const token = backendJson.data.accessToken;

          const adminUserPayload = {
            id: backendUser.id,
            name: `${backendUser.profile?.firstName || 'Super'} ${backendUser.profile?.lastName || 'Admin'}`.trim(),
            mobile: backendUser.profile?.phone || '9876543210',
            email: backendUser.email,
            avatar: backendUser.profile?.avatarUrl || null,
            role: 'admin' as const,
            language: 'en' as const,
            isVerified: backendUser.isVerified ?? true,
            createdAt: backendUser.createdAt,
          };

          const isProduction = process.env.NODE_ENV === 'production';
          const response = NextResponse.json({
            success: true,
            message: 'Admin logged in successfully via Live Database.',
            user: adminUserPayload,
            accessToken: token,
          });

          response.cookies.set('access_token', token, {
            httpOnly: true,
            secure: isProduction,
            sameSite: 'lax',
            path: '/',
            maxAge: 7 * 24 * 60 * 60,
          });

          response.cookies.set('admin_access_token', token, {
            httpOnly: false,
            secure: isProduction,
            sameSite: 'lax',
            path: '/',
            maxAge: 7 * 24 * 60 * 60,
          });

          return response;
        }
      }
    } catch (err) {
      // Backend not running yet or connection refused; continue to allowed credentials
    }

    // 2. Allow valid admin credentials (admin@yathu.com or admin@yathuarokiyagam.com)
    const isValidAdmin =
      (normalizedEmail === 'admin@yathu.com' && password === 'admin123') ||
      (normalizedEmail === 'admin@yathuarokiyagam.com' && password === 'Password123');

    if (!isValidAdmin) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    const adminPayload = {
      id: '13abcd44-1c05-4a5d-9587-f5e69f1ec184', // Seeded admin UUID in Neon DB
      userId: '13abcd44-1c05-4a5d-9587-f5e69f1ec184',
      name: 'Super Admin',
      mobile: '9876543210',
      email: normalizedEmail,
      avatar: null,
      role: 'admin' as const,
      language: 'en' as const,
      isVerified: true,
      createdAt: new Date().toISOString(),
    };

    // Sign Access Token (7 days) and Refresh Token (30 days) with shared secret
    const accessToken = signToken(adminPayload, secret, 7 * 24 * 60);
    const refreshToken = signToken(adminPayload, secret, 30 * 24 * 60);

    const isProduction = process.env.NODE_ENV === 'production';
    const response = NextResponse.json({
      success: true,
      message: 'Admin logged in successfully.',
      user: {
        ...adminPayload,
        role: 'admin' as const,
      },
      accessToken,
    });

    response.cookies.set('access_token', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    response.cookies.set('admin_access_token', accessToken, {
      httpOnly: false,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    response.cookies.set('refresh_token', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      path: '/api/auth/refresh',
      maxAge: 24 * 60 * 60,
    });

    return response;
  } catch (err) {
    return NextResponse.json(
      { success: false, message: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
