import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mobile } = body;

    if (!mobile || !/^\d{10}$/.test(mobile)) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid 10-digit mobile number' },
        { status: 400 }
      );
    }

    // Standard mock OTP code for development and client demo
    const mockOtp = '123456';
    console.log(`[MOCK OTP SERVICE] Sent OTP ${mockOtp} to mobile +91${mobile}`);

    const response = NextResponse.json({
      success: true,
      message: 'OTP sent successfully.',
      resendAfterSeconds: 30
    });

    // Save pending mobile in a short-lived secure cookie for verification matching
    response.cookies.set('pending_otp_mobile', mobile, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/api/auth',
      maxAge: 300 // 5 minutes
    });

    return response;
  } catch (err) {
    return NextResponse.json(
      { success: false, message: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
