import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import getDb from "@/lib/db";
import { createTokenForUser } from "@/lib/session";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { data: null, error: "Invalid credentials" },
        { status: 400 },
      );
    }

    const db = getDb();
    const user = db
      .prepare(`SELECT id, email, password FROM user WHERE email = ?`)
      .get(parsed.data.email) as
      | { id: string; email: string; password: string }
      | undefined;

    const dummy = "$2b$10$invalid.hash.to.prevent.timing.attacks.xxxxxxxx";
    const match = await bcrypt.compare(
      parsed.data.password,
      user?.password ?? dummy,
    );

    if (!user || !match) {
      return NextResponse.json(
        { data: null, error: "Invalid email or password" },
        { status: 401 },
      );
    }

    const response = NextResponse.json({
      data: { success: true },
      error: null,
    });

    // Create a signed token for the user and set cookies.
    try {
      const token = await createTokenForUser(user.id);
      response.cookies.set({
        name: "klarhet_token",
        value: token,
        httpOnly: true,
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7,
      });
    } catch (e) {
      console.debug("[api/auth/login] failed to set klarhet_token", e);
    }

    // Lightweight readable flag for middleware UX decisions only.
    response.cookies.set({
      name: "klarhet_logged_in",
      value: "1",
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (err) {
    console.error("[api/auth/login]", err);
    return NextResponse.json(
      { data: null, error: "Internal server error" },
      { status: 500 },
    );
  }
}
