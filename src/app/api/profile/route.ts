import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";
import { requireAuth } from "@/lib/session";

export async function GET() {
  try {
    await requireAuth();
    const db = getDb();
    const user = db
      .prepare("SELECT name, photo_url FROM user LIMIT 1")
      .get() as { name: string | null; photo_url: string | null } | undefined;

    return NextResponse.json({
      data: { name: user?.name ?? null, photoUrl: user?.photo_url ?? null },
      error: null,
    });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { data: null, error: "Unauthorized" },
        { status: 401 },
      );
    }
    console.error("[api/profile GET]", err);
    return NextResponse.json(
      { data: null, error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAuth();
    const body = await request.json();
    const { name, photoUrl } = body;

    if (typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { data: null, error: "Invalid name" },
        { status: 400 },
      );
    }

    if (photoUrl !== null && typeof photoUrl !== "string") {
      return NextResponse.json(
        { data: null, error: "Invalid photo URL" },
        { status: 400 },
      );
    }

    const db = getDb();
    db.prepare("UPDATE user SET name = ?, photo_url = ? WHERE id = ?").run(
      name.trim(),
      photoUrl,
      "owner",
    );

    return NextResponse.json(
      { data: { name: name.trim(), photoUrl }, error: null },
      { status: 200 },
    );
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { data: null, error: "Unauthorized" },
        { status: 401 },
      );
    }
    console.error("[api/profile PUT]", err);
    return NextResponse.json(
      { data: null, error: "Internal server error" },
      { status: 500 },
    );
  }
}
