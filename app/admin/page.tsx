import type { Metadata } from "next";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth";
import { listWaitlist, type Signup } from "@/lib/db";
import { logout } from "./actions";
import DeleteButton from "./delete-button";
import styles from "./admin.module.css";

export const metadata: Metadata = { title: "Waiting list — Trailmate admin", robots: { index: false, follow: false } };

const fmt = new Intl.DateTimeFormat("it-IT", { dateStyle: "short", timeStyle: "short", timeZone: "Europe/Rome" });
const day = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Rome" });

export default function AdminPage() {
  return (
    <main className={styles.page}>
      <div className={styles.top}>
        <div className={styles.brand}><span className={styles.led} />TRAILMATE · ADMIN</div>
        <div className={styles.actions}>
          <a href="/admin/export" className={`btn-ghost ${styles.small}`}>Export CSV</a>
          <form action={logout}>
            <button type="submit" className={`btn-ghost ${styles.small}`}>Log out</button>
          </form>
        </div>
      </div>
      <Suspense fallback={<p className="mono" style={{ color: "#8e969e" }}>Loading…</p>}>
        <Waitlist />
      </Suspense>
    </main>
  );
}

async function Waitlist() {
  await requireAdmin();
  const rows = await listWaitlist();
  const { todayCount, weekCount } = summarize(rows);

  return (
    <>
      <div className={styles.stats}>
        <Stat label="Total signups" value={rows.length} />
        <Stat label="Today" value={todayCount} />
        <Stat label="Last 7 days" value={weekCount} />
      </div>
      <div className={styles.card}>
        {rows.length === 0 ? (
          <p className={styles.empty}>No one on the waiting list yet.</p>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr><th>#</th><th>Email</th><th>Signed up</th><th /></tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.id}>
                    <td className={`mono ${styles.num}`}>{rows.length - i}</td>
                    <td>{r.email}</td>
                    <td className={`mono ${styles.date}`}>{fmt.format(r.createdAt)}</td>
                    <td style={{ width: "1%" }}><DeleteButton id={r.id} email={r.email} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

function summarize(rows: Signup[]) {
  const now = new Date();
  const today = day.format(now);
  const weekAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;
  return {
    todayCount: rows.filter((r) => day.format(r.createdAt) === today).length,
    weekCount: rows.filter((r) => r.createdAt.getTime() >= weekAgo).length,
  };
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className={styles.stat}>
      <div className={`mono ${styles.statLabel}`}>{label}</div>
      <div className={styles.statValue}>{value}</div>
    </div>
  );
}
