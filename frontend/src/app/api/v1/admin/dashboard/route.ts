import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // 1. Get token from Authorization header, access_token cookie, or admin_access_token cookie
    let token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      token = request.cookies.get("access_token")?.value || request.cookies.get("admin_access_token")?.value;
    }

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required to access administrative dashboard.",
        },
        { status: 401 }
      );
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
