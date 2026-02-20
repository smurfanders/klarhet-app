import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: { token: string } },
) {
  try {
    const { token } = params;
    if (!token || !/^[a-f0-9]{24}$/.test(token)) {
      return NextResponse.json(
        { data: null, error: "Invalid link" },
        { status: 400 },
      );
    }

    const db = getDb();
    const feedbackRequest = db
      .prepare(
        `SELECT id, company, role, language FROM feedback_requests WHERE token = ?`,
      )
      .get(token) as
      | { id: string; company: string; role: string; language: string }
      | undefined;

    if (!feedbackRequest) {
      return NextResponse.json(
        { data: null, error: "Form not found" },
        { status: 404 },
      );
    }

    const existing = db
      .prepare(`SELECT id FROM responses WHERE feedback_request_id = ?`)
      .get(feedbackRequest.id);

    if (existing) {
      return NextResponse.json(
        {
          data: null,
          error: "This form has already been completed. Thank you!",
        },
        { status: 409 },
      );
    }

    const user = db
      .prepare(`SELECT name, photo_url FROM user LIMIT 1`)
      .get() as { name: string | null; photo_url: string | null } | undefined;

    return NextResponse.json({
      data: {
        company: feedbackRequest.company,
        role: feedbackRequest.role,
        language: feedbackRequest.language,
        jobseekerName: user?.name ?? null,
        jobseekerPhotoUrl: user?.photo_url ?? null,
      },
      error: null,
    });
  } catch (err) {
    console.error("[api/form GET]", err);
    return NextResponse.json(
      { data: null, error: "Internal server error" },
      { status: 500 },
    );
  }
}
