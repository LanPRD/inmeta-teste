import swc from "unplugin-swc";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    root: "./",
    fileParallelism: false,
    globalSetup: ["__tests__/helpers/setup-integration.ts"],
    env: {
      NODE_ENV: "test",
      DATABASE_URL:
        "postgresql://inmeta:inmeta@localhost:5433/inmeta_test?schema=public"
    },
    include: ["__tests__/integration/**/*.spec.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/**/*.ts"],
      exclude: ["**/*.spec.ts", "src/main.ts", "**/generated/**"]
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
