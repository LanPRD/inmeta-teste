import { execSync } from "node:child_process";

const databaseUrl =
  process.env.DATABASE_URL ??
  "postgresql://inmeta:inmeta@localhost:5432/inmeta?schema=public";

/**
 * Vitest globalSetup — aplica o schema do Prisma no banco de e2e.
 * Roda uma vez antes de todos os testes e2e.
 */
export function setup(): void {
  execSync("npx prisma db push", {
    env: { ...process.env, DATABASE_URL: databaseUrl },
    stdio: "pipe",
    windowsHide: true
  });
}
