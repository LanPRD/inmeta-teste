import swc from "unplugin-swc";
import { defineConfig } from "vitest/config";

const databaseUrl =
  process.env.DATABASE_URL ??
  "postgresql://inmeta:inmeta@localhost:5433/inmeta_test?schema=public";

export default defineConfig({
  test: {
    include: ["__tests__/**/*.e2e-spec.ts"],
    globals: true,
    root: "./",
    fileParallelism: false,
    globalSetup: ["__tests__/helpers/setup-e2e.ts"],
    env: {
      NODE_ENV: "test",
      DATABASE_URL: databaseUrl
    }
  },
  resolve: {
    tsconfigPaths: true,
    alias: {
      "@": "./src"
    }
  },
  plugins: [
    swc.vite({
      module: { type: "es6" }
    })
  ]
});
