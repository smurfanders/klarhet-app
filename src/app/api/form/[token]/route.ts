import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: { token: string } },
) {
  try {
    const { token } = await params;
    if (!token || !/^[a-f0-9]{24}$/.test(token)) {
      return NextResponse.json(
        { data: null, error: "Invalid link" },
        { status: 400 },
      );
    }

    const db = getDb();
    const application = db
      .prepare(
        `SELECT id, company, role, language FROM applications WHERE token = ?`,
      )
      .get(token) as
      | { id: string; company: string; role: string; language: string }
      | undefined;

    if (!application) {
      return NextResponse.json(
        { data: null, error: "Form not found" },
        { status: 404 },
      );
    }

    const existing = db
      .prepare(`SELECT id FROM responses WHERE application_id = ?`)
      .get(application.id);

    if (existing) {
      return NextResponse.json(
        {
          data: null,
          error: "This form has already been completed. Thank you!",
        },
        { status: 409 },
      );
    }

    return NextResponse.json({
      data: {
        company: application.company,
        role: application.role,
        language: application.language,
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
