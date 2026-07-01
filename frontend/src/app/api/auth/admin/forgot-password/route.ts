import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    // In production: check if admin email exists in database, generate token, send email.
    // For mock: generate random 64-char reset token and output mock email link in logs.
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetLink = `${request.nextUrl.origin}/admin/reset-password?token=${resetToken}`;
    
    console.log(`[MOCK PASSWORD RESET] Generated reset link for admin ${email}:`);
    console.log(`Link: ${resetLink}`);

    return NextResponse.json({
      success: true,
      message: 'Reset link sent! Please check your email inbox.'
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
