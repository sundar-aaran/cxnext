import { config } from "dotenv";
import { z } from "zod";

config();

export const baseEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  FRONTEND_URL: z.string().url().default("http://localhost:3000"),
});

export type BaseEnv = z.infer<typeof baseEnvSchema>;

export function loadEnv<T extends z.ZodRawShape>(
  shape: T,
  source: NodeJS.ProcessEnv = process.env,
): z.infer<z.ZodObject<T>> {
  return z.object(shape).parse(source);
}

export function loadBaseEnv(source: NodeJS.ProcessEnv = process.env): BaseEnv {
  return baseEnvSchema.parse(source);
}
