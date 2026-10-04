import { PrismaClient } from "@prisma/client";

function getNormalizedDatabaseUrl(): string | undefined {
  const url = process.env.DATABASE_URL;
  if (!url) return undefined;

  // Supabase connection pooler (port 6543) runs PgBouncer / Supavisor in transaction mode.
  // In transaction mode, Prisma's default prepared statements collide across multiplexed
  // connections, triggering "PostgresError 42P05: prepared statement 's0' already exists"
  // which surfaces as PrismaClientUnknownRequestError.
  // Appending ?pgbouncer=true tells Prisma to disable prepared statements.
  if (url.includes(":6543") || url.includes("pooler.supabase.com")) {
    if (!url.includes("pgbouncer=true")) {
      const delimiter = url.includes("?") ? "&" : "?";
      return `${url}${delimiter}pgbouncer=true&connection_limit=1`;
    }
  }

  return url;
}

const g = globalThis as unknown as { db?: PrismaClient };

const databaseUrl = getNormalizedDatabaseUrl();

export const db =
  g.db ??
  new PrismaClient(
    databaseUrl
      ? {
          datasources: {
            db: {
              url: databaseUrl,
            },
          },
        }
      : undefined
  );

if (process.env.NODE_ENV !== "production") {
  g.db = db;
}
