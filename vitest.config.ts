import swc from "unplugin-swc";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    root: "./",
    passWithNoTests: true,
    exclude: [
      "node_modules",
      "dist",
      "__tests__/e2e/**",
      "__tests__/integration/**"
    ],
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
    // This is required to build the test files with SWC
    swc.vite({
      // Explicitly set the module type to avoid inheriting this value from a `.swcrc` config file
      module: { type: "es6" }
    })
  ]
});
