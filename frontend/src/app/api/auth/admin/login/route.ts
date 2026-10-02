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
    const backendApiUrl =
      process.env.INTERNAL_API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      'http://localhost:8080/api/v1';

    // Authenticate exclusively against live Express backend database
    try {
      const backendRes = await fetch(`${backendApiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail, password }),
      });

      const backendJson = await backendRes.json().catch(() => ({}));

      if (!backendRes.ok || !backendJson.success) {
        return NextResponse.json(
          {
            success: false,
            message: backendJson.message || 'Invalid email or password.',
          },
          { status: backendRes.status || 401 }
        );
      }

      const backendUser = backendJson.data?.user;
      const token = backendJson.data?.accessToken;

      if (!backendUser || !token) {
        return NextResponse.json(
          { success: false, message: 'Invalid response from authentication server.' },
          { status: 502 }
        );
      }

      // Verify that authenticated user has administrator privileges
      const userRole = (backendUser.role || '').toLowerCase();
      if (userRole !== 'admin') {
        return NextResponse.json(
          { success: false, message: 'Access denied. Administrator privileges required.' },
          { status: 403 }
        );
      }

      const adminUserPayload = {
        id: backendUser.id,
        name: `${backendUser.profile?.firstName || 'Super'} ${backendUser.profile?.lastName || 'Admin'}`.trim(),
        mobile: backendUser.profile?.phone || backendUser.phone || '',
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
        message: 'Admin logged in successfully.',
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
    } catch (err: any) {
      return NextResponse.json(
        {
          success: false,
          message: 'Authentication service temporarily unavailable. Please try again shortly.',
        },
        { status: 503 }
      );
    }
  } catch (err) {
    return NextResponse.json(
      { success: false, message: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
