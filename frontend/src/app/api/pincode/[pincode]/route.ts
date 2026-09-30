import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ pincode: string }> }
) {
  try {
    const { pincode } = await context.params;

    if (!pincode || !/^\d{6}$/.test(pincode)) {
      return NextResponse.json(
        { error: 'Invalid pincode. Must be exactly 6 digits.' },
        { status: 400 }
      );
    }

    const backendUrl =
      process.env.BACKEND_URL ||
      process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/v1\/?$/, "") ||
      "http://localhost:8080";

    try {
      const backendRes = await fetch(
        `${backendUrl}/api/v1/shipping/pincode/${encodeURIComponent(pincode)}`,
        {
          headers: { "Content-Type": "application/json" },
          next: { revalidate: 60 },
        }
      );

      if (backendRes.ok) {
        const resData = await backendRes.json();
        const data = resData.data || resData;
        if (data && data.serviceable) {
          return NextResponse.json({
            available: true,
            serviceable: true,
            city: data.city || 'Tamil Nadu',
            state: data.state || 'Tamil Nadu',
            estimatedDays: data.estimatedDays || 3,
            shippingCharge: data.shippingCharge ?? 50,
            freeDeliveryThreshold: data.freeDeliveryThreshold ?? 499,
          });
        } else {
          return NextResponse.json({
            available: false,
            serviceable: false,
            message: data?.message || 'Delivery is currently not available for this pincode.',
          });
        }
      }
    } catch (err) {
      console.warn("Backend shipping service unreachable, falling back to regional rules:", err);
    }

    // Regional fallback if backend database is temporarily unreachable
    if (pincode.startsWith('6')) {
      return NextResponse.json({
        available: true,
        serviceable: true,
        estimatedDays: 3,
        city: pincode.startsWith('600') ? 'Chennai' : 'Tamil Nadu',
        state: 'Tamil Nadu',
        freeDeliveryThreshold: 499,
      });
    } else if (/^[1-5]/.test(pincode)) {
      return NextResponse.json({
        available: true,
        serviceable: true,
        estimatedDays: 5,
        city: 'Metro City',
        state: 'India',
        freeDeliveryThreshold: 499,
      });
    } else {
      return NextResponse.json({
        available: false,
        serviceable: false,
      });
    }
  } catch (err) {
    return NextResponse.json(
      { error: 'Something went wrong, please try again.' },
      { status: 500 }
    );
  }
}
