import { execSync } from "node:child_process";

/**
 * Vitest globalSetup — aplica o schema do Prisma no banco de teste.
 * Roda uma vez antes de todos os testes de integração.
 */
export function setup(): void {
  const databaseUrl =
    "postgresql://inmeta:inmeta@localhost:5433/inmeta_test?schema=public";

  execSync("npx prisma db push", {
    env: { ...process.env, DATABASE_URL: databaseUrl },
    stdio: "pipe",
    windowsHide: true
  });
}
