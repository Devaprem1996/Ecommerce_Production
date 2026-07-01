import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password } = body;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired reset link. Please request a new one.' },
        { status: 400 }
      );
    }

    // Password strength check: min 8 characters, must have one uppercase, one number
    if (!password || password.length < 8) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 8 characters long.' },
        { status: 400 }
      );
    }

    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    if (!hasUppercase || !hasNumber) {
      return NextResponse.json(
        { success: false, message: 'Password must contain at least one uppercase letter and one number.' },
        { status: 400 }
      );
    }

    // In production: find token, hash password, save in DB, invalidate token.
    console.log(`[MOCK PASSWORD RESET] Successfully reset password using token: ${token.substring(0, 10)}...`);

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully. You can now login with your new password.'
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
