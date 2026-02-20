import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";
import { requireAuth } from "@/lib/session";

export async function GET(
  _request: NextRequest,
  { params }: { params: { feedbackRequestId: string } },
) {
  try {
    await requireAuth();
    const { feedbackRequestId } = params;
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(feedbackRequestId)) {
      return NextResponse.json(
        { data: null, error: "Invalid ID" },
        { status: 400 },
      );
    }

    const db = getDb();
    const feedbackRequest = db
      .prepare(
        `SELECT id, company, role, language, interview_date, created_at
       FROM feedback_requests WHERE id = ?`,
      )
      .get(feedbackRequestId);

    if (!feedbackRequest) {
      return NextResponse.json(
        { data: null, error: "Not found" },
        { status: 404 },
      );
    }

    const response = db
      .prepare(
        `
      SELECT id, feedback_request_id, q1_match, q1_detail, q2_communication, q2_checkboxes,
             q3_reason, q3_detail, q4_future, q4_detail, q5_rating,
             q6_profile, q7_interview, q7_other, submitted_at
      FROM responses WHERE feedback_request_id = ?
    `,
      )
      .get(feedbackRequestId) as Record<string, unknown> | undefined;

    if (response?.q2_checkboxes) {
      try {
        response.q2_checkboxes = JSON.parse(response.q2_checkboxes as string);
      } catch {
        response.q2_checkboxes = null;
      }
    }

    return NextResponse.json({
      data: { feedbackRequest, response: response ?? null },
      error: null,
    });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { data: null, error: "Unauthorized" },
        { status: 401 },
      );
    }
    console.error("[api/responses GET]", err);
    return NextResponse.json(
      { data: null, error: "Internal server error" },
      { status: 500 },
    );
  }
}
