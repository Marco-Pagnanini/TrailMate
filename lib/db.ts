import "server-only";
import postgres from "postgres";

declare global {
  var __trailmateSql: postgres.Sql | undefined;
  var __trailmateSchema: Promise<void> | undefined;
}

function getSql() {
  if (!globalThis.__trailmateSql) {
    // Neon on Vercel may expose the connection string under different names
    // depending on how the integration was connected.
    const url =
      process.env.DATABASE_URL ||
      process.env.POSTGRES_URL ||
      process.env.DATABASE_URL_UNPOOLED ||
      process.env.POSTGRES_URL_NON_POOLING;
    if (!url) {
      throw new Error("No database URL set (DATABASE_URL / POSTGRES_URL / DATABASE_URL_UNPOOLED)");
    }
    const local = /localhost|127\.0\.0\.1/.test(url);
    globalThis.__trailmateSql = postgres(url, {
      ssl: local ? false : "require",
      max: 5,
      idle_timeout: 20,
      // Required for transaction-mode poolers (Neon/Supabase pooled URLs).
      prepare: false,
    });
  }
  return globalThis.__trailmateSql;
}

/** Creates the table on first use, once per server instance. */
async function ensureSchema() {
  if (!globalThis.__trailmateSchema) {
    const sql = getSql();
    globalThis.__trailmateSchema = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS waitlist (
          id          BIGSERIAL PRIMARY KEY,
          email       TEXT NOT NULL,
          created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
        )`;
      await sql`CREATE UNIQUE INDEX IF NOT EXISTS waitlist_email_unique ON waitlist (lower(email))`;
    })().catch((err) => {
      globalThis.__trailmateSchema = undefined;
      throw err;
    });
  }
  return globalThis.__trailmateSchema;
}

export type Signup = { id: string; email: string; createdAt: Date };

/** Returns true if the email was added, false if it was already on the list. */
export async function addToWaitlist(email: string): Promise<boolean> {
  await ensureSchema();
  const sql = getSql();
  const rows = await sql`
    INSERT INTO waitlist (email) VALUES (${email})
    ON CONFLICT ((lower(email))) DO NOTHING
    RETURNING id`;
  return rows.length > 0;
}

export async function listWaitlist(): Promise<Signup[]> {
  await ensureSchema();
  const sql = getSql();
  const rows = await sql<{ id: string; email: string; created_at: Date }[]>`
    SELECT id::text, email, created_at FROM waitlist ORDER BY created_at DESC`;
  return rows.map((r) => ({ id: r.id, email: r.email, createdAt: r.created_at }));
}

export async function deleteFromWaitlist(id: string): Promise<void> {
  await ensureSchema();
  const sql = getSql();
  await sql`DELETE FROM waitlist WHERE id = ${id}::bigint`;
}
