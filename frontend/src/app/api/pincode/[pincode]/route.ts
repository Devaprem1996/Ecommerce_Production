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

    // Rule: Pincodes starting with 6 (South / Tamil Nadu) get faster delivery.
    // Pincodes starting with 1-5 get standard delivery.
    // Others (7, 8, 9) are out of delivery zone.
    if (pincode.startsWith('6')) {
      return NextResponse.json({
        available: true,
        estimatedDays: 3,
        city: 'Chennai',
        freeDeliveryThreshold: 499
      });
    } else if (/^[1-5]/.test(pincode)) {
      return NextResponse.json({
        available: true,
        estimatedDays: 5,
        city: 'Metro City',
        freeDeliveryThreshold: 499
      });
    } else {
      return NextResponse.json({
        available: false
      });
    }
  } catch (err) {
    return NextResponse.json(
      { error: 'Something went wrong, please try again.' },
      { status: 500 }
    );
  }
}
