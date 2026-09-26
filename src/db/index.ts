import path from "path";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

type Database = ReturnType<typeof drizzle<typeof schema>>;

let instance: Database | undefined;

function getDb(): Database {
  if (instance) return instance;

  const localDbPath = path.join(process.cwd(), "prisma", "dev.db");
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL || `file:${localDbPath}`,
    authToken: process.env.TURSO_AUTH_TOKEN || undefined,
  });

  instance = drizzle(client, { schema });
  return instance;
}

// Built on first use rather than at import time. On Cloudflare Workers the
// environment is only populated once a request is being handled, so reading
// process.env at module scope yields undefined and the connection silently
// falls back to the local dev file.
export const db = new Proxy({} as Database, {
  get(_target, prop, receiver) {
    return Reflect.get(getDb(), prop, receiver);
  },
});

export { schema };
