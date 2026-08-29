import { NextResponse } from "next/server";

import {
  ADMIN_SESSION_COOKIE,
  createAdminSessionToken,
  isAdminPasswordConfigured,
  isValidAdminPassword,
} from "@/lib/admin-auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const password = typeof body?.password === "string" ? body.password : "";

    if (!isAdminPasswordConfigured()) {
      return NextResponse.json(
        {
          error: "Admin password is not configured for this project.",
        },
        { status: 500 },
      );
    }

    if (!isValidAdminPassword(password)) {
      return NextResponse.json(
        {
          error: "Incorrect password.",
        },
        { status: 401 },
      );
    }

    const response = NextResponse.json({ success: true });
    const sessionToken = await createAdminSessionToken();

    response.cookies.set({
      name: ADMIN_SESSION_COOKIE,
      value: sessionToken,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 12,
    });

    return response;
  } catch {
    return NextResponse.json(
      {
        error: "Invalid login request.",
      },
      { status: 400 },
    );
  }
}
