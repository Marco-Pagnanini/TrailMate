import "server-only";
import { timingSafeEqual, createHash } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  createSessionToken,
  isValidSessionToken,
} from "./session";

/** Constant-time password check against ADMIN_PASSWORD. */
export function checkPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const a = createHash("sha256").update(input).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

export async function startSession() {
  const token = await createSessionToken();
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function endSession() {
  (await cookies()).delete(SESSION_COOKIE);
}

export async function isAdmin(): Promise<boolean> {
  return isValidSessionToken((await cookies()).get(SESSION_COOKIE)?.value);
}

/** Data Access Layer guard: call before reading or mutating admin data. */
export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}
