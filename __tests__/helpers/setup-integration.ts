import { execSync } from "node:child_process";

const databaseUrl =
  process.env.DATABASE_URL ??
  "postgresql://inmeta:inmeta@localhost:5433/inmeta_test?schema=public";

/**
 * Vitest globalSetup — aplica o schema do Prisma no banco de teste.
 * Roda uma vez antes de todos os testes de integração.
 */
export function setup(): void {
  execSync("npx prisma db push", {
    env: { ...process.env, DATABASE_URL: databaseUrl },
    stdio: "pipe",
    windowsHide: true
  });
}
