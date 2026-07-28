import { execSync } from "node:child_process";

// Se DATABASE_URL já vem do ambiente (ex: CI), assume-se que o banco é gerenciado
// externamente e o Docker Compose local não é tocado.
const usingDefaultDatabase = !process.env.DATABASE_URL;

const databaseUrl =
  process.env.DATABASE_URL ??
  "postgresql://inmeta:inmeta@localhost:5433/inmeta_test?schema=public";

/**
 * Vitest globalSetup — garante que o Postgres de teste está de pé (idempotente,
 * não recria se já estiver rodando) e aplica as migrations do Prisma. Roda uma
 * vez antes de todos os testes e2e.
 *
 * Reaproveita o mesmo banco de teste da integração (não o banco de dev), já
 * que o e2e limpa as tabelas a cada teste (cleanDatabase) e isso não pode
 * apagar dados reais de desenvolvimento.
 *
 * Usa `migrate deploy` (não `db push`) porque parte do schema é aplicada via
 * SQL bruto nas migrations (índices parciais/case-insensitive que o DSL do
 * Prisma não expressa) — `db push` ignoraria esse SQL.
 */
export function setup(): void {
  if (usingDefaultDatabase) {
    execSync("docker compose -f docker-compose.test.yml up -d --wait", {
      stdio: "pipe",
      windowsHide: true
    });
  }

  execSync("npx prisma migrate deploy", {
    env: { ...process.env, DATABASE_URL: databaseUrl },
    stdio: "pipe",
    windowsHide: true
  });
}

/**
 * Derruba o container de teste ao final da suíte — ele só existe para
 * sustentar os testes automatizados, então não há motivo para sobreviver
 * entre execuções (diferente do container de dev, que fica de pé por conta
 * do desenvolvedor).
 */
export function teardown(): void {
  if (usingDefaultDatabase) {
    execSync("docker compose -f docker-compose.test.yml down", {
      stdio: "pipe",
      windowsHide: true
    });
  }
}
