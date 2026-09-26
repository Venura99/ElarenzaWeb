import { NextResponse } from "next/server";
import { count } from "drizzle-orm";
import { db, schema } from "@/db";

export const dynamic = "force-dynamic";

// Temporary diagnostic endpoint. Reports whether configuration is visible at
// runtime and whether the database is reachable, without exposing any values.
export async function GET() {
  const envPresence = Object.fromEntries(
    [
      "TURSO_DATABASE_URL",
      "TURSO_AUTH_TOKEN",
      "SESSION_SECRET",
      "ADMIN_USERNAME",
      "ADMIN_PASSWORD_HASH",
      "CLOUDINARY_CLOUD_NAME",
      "CLOUDINARY_API_KEY",
      "CLOUDINARY_API_SECRET",
    ].map((key) => [key, Boolean(process.env[key])])
  );

  const urlScheme = (process.env.TURSO_DATABASE_URL ?? "").split(":")[0] || "unset";

  let database: { ok: boolean; productCount?: number; error?: string };
  try {
    const rows = await db.select({ value: count() }).from(schema.products);
    database = { ok: true, productCount: rows[0]?.value ?? 0 };
  } catch (error) {
    database = {
      ok: false,
      error: error instanceof Error ? error.message.slice(0, 300) : String(error).slice(0, 300),
    };
  }

  return NextResponse.json({ envPresence, urlScheme, database });
}
