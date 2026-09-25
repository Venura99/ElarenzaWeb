// One-time helper: applies all Prisma migration SQL files to a Turso database
// directly over the network, without needing the Turso CLI installed.
// Usage: node scripts/push-schema-to-turso.js
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { createClient } = require("@libsql/client");

async function main() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    console.error("TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set in .env");
    process.exit(1);
  }

  const client = createClient({ url, authToken });

  const migrationsDir = path.join(__dirname, "..", "prisma", "migrations");
  const folders = fs
    .readdirSync(migrationsDir)
    .filter((f) => fs.statSync(path.join(migrationsDir, f)).isDirectory())
    .sort();

  for (const folder of folders) {
    const sqlPath = path.join(migrationsDir, folder, "migration.sql");
    if (!fs.existsSync(sqlPath)) continue;

    const sql = fs.readFileSync(sqlPath, "utf8");
    const statements = sql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.replace(/--.*$/gm, "").trim() === false);

    console.log(`Applying ${folder} (${statements.length} statement(s))...`);
    for (const statement of statements) {
      const cleaned = statement.replace(/--.*$/gm, "").trim();
      if (!cleaned) continue;
      try {
        await client.execute(cleaned);
      } catch (err) {
        const msg = String(err.message || err);
        // SQLite reports already-applied DDL differently per statement type.
        const alreadyApplied =
          msg.includes("already exists") || msg.includes("duplicate column");
        if (alreadyApplied) {
          console.log(`  (skipped, already applied): ${cleaned.slice(0, 60)}...`);
        } else {
          throw err;
        }
      }
    }
  }

  console.log("Schema pushed to Turso successfully.");
  client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
