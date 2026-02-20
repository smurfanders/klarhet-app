import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import getDb from "@/lib/db";
import { requireAuth } from "@/lib/session";
import { createFeedbackRequestSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    console.debug(
      "[api/feedback-requests] incoming cookie header:",
      request.headers.get("cookie"),
    );
    await requireAuth();
    const body = await request.json();
    const parsed = createFeedbackRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { data: null, error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const db = getDb();
    const id = uuidv4();
    const token = uuidv4().replace(/-/g, "").slice(0, 24);

    db.prepare(
      `
      INSERT INTO feedback_requests (id, company, role, language, token, interview_date)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    ).run(
      id,
      parsed.data.company,
      parsed.data.role,
      parsed.data.language,
      token,
      parsed.data.interview_date ?? null,
    );

    const feedbackRequest = db
      .prepare(`SELECT * FROM feedback_requests WHERE id = ?`)
      .get(id);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin;

    return NextResponse.json(
      {
        data: {
          ...(feedbackRequest as object),
          link: `${appUrl}/f/${token}`,
        },
        error: null,
      },
      { status: 201 },
    );
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { data: null, error: "Unauthorized" },
        { status: 401 },
      );
    }
    console.error("[api/feedback-requests POST]", err);
    return NextResponse.json(
      { data: null, error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    await requireAuth();
    const db = getDb();
    const feedbackRequests = db
      .prepare(
        `
      SELECT fr.*, r.id AS response_id, r.q1_match, r.q2_communication,
             r.q3_reason, r.q4_future, r.q5_rating, r.submitted_at
      FROM feedback_requests fr
      LEFT JOIN responses r ON r.feedback_request_id = fr.id
      ORDER BY fr.created_at DESC
    `,
      )
      .all();
    return NextResponse.json({ data: feedbackRequests, error: null });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { data: null, error: "Unauthorized" },
        { status: 401 },
      );
    }
    console.error("[api/feedback-requests GET]", err);
    return NextResponse.json(
      { data: null, error: "Internal server error" },
      { status: 500 },
    );
  }
}
