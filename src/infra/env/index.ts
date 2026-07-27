import { config } from "dotenv";
import path from "node:path";
import { z } from "zod";

const envFile = process.env.NODE_ENV === "test" ? ".env.test" : ".env";

config({ path: path.resolve(process.cwd(), envFile), quiet: true });

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.url()
});

function parseEnv() {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error("❌ Invalid environment variables:");
    console.error(z.treeifyError(parsed.error));
    throw new Error("Invalid environment variables");
  }

  return parsed.data;
}

export const env = parseEnv();
export type Env = z.infer<typeof envSchema>;
