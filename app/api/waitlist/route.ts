import { NextResponse } from "next/server";
import { addToWaitlist } from "@/lib/db";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  const { email, company } = (body ?? {}) as { email?: unknown; company?: unknown };

  // Honeypot: real users never fill this hidden field.
  if (typeof company === "string" && company.trim() !== "") {
    return NextResponse.json({ ok: true, alreadyRegistered: false });
  }

  const normalized = typeof email === "string" ? email.trim().toLowerCase() : "";
  if (!EMAIL_RE.test(normalized) || normalized.length > 254) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }

  try {
    const added = await addToWaitlist(normalized);
    return NextResponse.json({ ok: true, alreadyRegistered: !added });
  } catch (err) {
    console.error("waitlist insert failed", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
