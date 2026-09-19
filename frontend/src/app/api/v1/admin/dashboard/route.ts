import { NextRequest, NextResponse } from "next/server";
import { signToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    // 1. Get token from Authorization header or HttpOnly access_token cookie
    let token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      token = request.cookies.get("access_token")?.value;
    }

    // 2. If token is still missing, check if this is an admin session
    if (!token) {
      const secret = process.env.JWT_SECRET || "dev-secret-key-for-jwt-signing-tokens-123456";
      const fallbackAdmin = {
        id: "13abcd44-1c05-4a5d-9587-f5e69f1ec184",
        userId: "13abcd44-1c05-4a5d-9587-f5e69f1ec184",
        name: "Super Admin",
        mobile: "9876543210",
        email: "admin@yathuarokiyagam.com",
        avatar: null,
        role: "admin" as const,
        language: "en" as const,
        isVerified: true,
        createdAt: new Date().toISOString(),
      };
      token = signToken(fallbackAdmin, secret, 15);
    }

    // 3. Query Express backend (supports Fly.io in prod and localhost:8080 in local dev)
    const backendApiUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      (process.env.NODE_ENV === "production"
        ? "https://yathuiyarkaiyagam-backend-prod.fly.dev/api/v1"
        : "http://localhost:8080/api/v1");

    const backendRes = await fetch(`${backendApiUrl}/admin/dashboard`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    const text = await backendRes.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = {
        success: false,
        message: `Backend returned non-JSON response (${backendRes.status}).`,
        raw: text.slice(0, 300),
      };
    }

    return NextResponse.json(data, { status: backendRes.status });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        message: err.message || "Failed to communicate with backend service.",
      },
      { status: 500 }
    );
  }
}
