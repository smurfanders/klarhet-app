import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, type SessionData } from "@/lib/session";

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ data: { success: true }, error: null });
  const session = await getIronSession<SessionData>(
    request,
    response,
    sessionOptions,
  );
  session.destroy();
  // Remove the middleware-visible flag cookie as well.
  response.cookies.delete("klarhet_logged_in", { path: "/" });
  // Remove server-side token cookie
  response.cookies.delete("klarhet_token", { path: "/" });
  return response;
}
