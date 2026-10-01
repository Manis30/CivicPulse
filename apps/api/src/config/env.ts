import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  HOST: z.string().default('0.0.0.0'),
  CLIENT_URL: z.string().default('http://localhost:5173'),
  JWT_SECRET: z.string().default('civicpulse_enterprise_secret_dev_2026'),
  MONGODB_URI: z.string().default('mongodb://127.0.0.1:27017/civicpulse'),
  REDIS_URL: z.string().default('redis://127.0.0.1:6379'),
  REDIS_HOST: z.string().optional(),
  REDIS_PORT: z.coerce.number().optional(),
  REDIS_USERNAME: z.string().optional(),
  REDIS_PASSWORD: z.string().optional(),
  AGENT_WORKER_CONCURRENCY: z.coerce.number().default(5),
  GEMINI_API_KEY: z.string().optional().default(''),
  GROQ_API_KEY: z.string().optional().default(''),
  GEMINI_MODEL: z.string().default('gemini-3.8-flash'),
  GROQ_MODEL: z.string().default('llama-3.3-70b-versatile'),
  CLOUDINARY_CLOUD_NAME: z.string().optional().default(''),
  CLOUDINARY_API_KEY: z.string().optional().default(''),
  CLOUDINARY_API_SECRET: z.string().optional().default(''),
  CLOUDINARY_FOLDER: z.string().default('civicpulse'),
  CLOUDINARY_URL: z.string().optional(),
  REDIS_CACHE_ENABLED: z.coerce.boolean().default(true),
  REDIS_CACHE_DEFAULT_TTL: z.coerce.number().default(60),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('Invalid environment variables:', parsedEnv.error.format());
  process.exit(1);
}

export const env = parsedEnv.data;
