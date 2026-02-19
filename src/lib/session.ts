import { cookies } from "next/headers";
import crypto from "node:crypto";
import getDb from "@/lib/db";

export interface SessionData {
  userId: string;
  email: string;
  isLoggedIn: boolean;
}

const TOKEN_NAME = "klarhet_token";
const TOKEN_TTL = 1000 * 60 * 60 * 24 * 7; // 7 days

function signToken(userId: string, expiresAt: number) {
  const secret = process.env.AUTH_SECRET || "";
  return crypto
    .createHmac("sha256", secret)
    .update(userId + "." + String(expiresAt))
    .digest("hex");
}

export async function createTokenForUser(userId: string) {
  const expires = Date.now() + TOKEN_TTL;
  const sig = signToken(userId, expires);
  return `${userId}.${expires}.${sig}`;
}

export async function getSession(): Promise<SessionData> {
  const ck = await cookies();
  const token = ck.get(TOKEN_NAME)?.value;
  if (!token) return { userId: "", email: "", isLoggedIn: false };

  try {
    const parts = token.split(".");
    if (parts.length !== 3) throw new Error("BAD");
    const [userId, expiresStr, sig] = parts;
    const expires = Number(expiresStr);
    if (!userId || !expires || Date.now() > expires) throw new Error("EXPIRED");
    const expected = signToken(userId, expires);
    if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig)))
      throw new Error("BADSIG");

    // Optionally look up email from DB
    let email = "";
    try {
      const db = getDb();
      const row = db.prepare("SELECT email FROM user WHERE id = ?").get(userId);
      email = row?.email ?? "";
    } catch (e) {
      // ignore DB errors here
    }

    return { userId, email, isLoggedIn: true };
  } catch (e) {
    console.debug("[session] token verify failed", e);
    return { userId: "", email: "", isLoggedIn: false };
  }
}

export async function requireAuth(): Promise<SessionData> {
  const session = await getSession();
  if (!session.isLoggedIn || !session.userId) throw new Error("UNAUTHORIZED");
  return session;
}
