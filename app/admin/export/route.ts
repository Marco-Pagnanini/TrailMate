import { isAdmin } from "@/lib/auth";
import { listWaitlist } from "@/lib/db";

export async function GET() {
  if (!(await isAdmin())) return new Response("Unauthorized", { status: 401 });
  const rows = await listWaitlist();
  const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const csv = ["email,signed_up_at", ...rows.map((r) => `${esc(r.email)},${r.createdAt.toISOString()}`)].join("\n");
  const date = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="trailmate-waitlist-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
