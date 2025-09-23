/**
 * Environment configuration for Speedy Van
 */

import { z } from 'zod';

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),
  
  // NextAuth
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url(),
  
  // Stripe
  STRIPE_SECRET_KEY: z.string(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string(),
  STRIPE_WEBHOOK_SECRET: z.string(),
  
  // Pusher
  PUSHER_APP_ID: z.string(),
  PUSHER_KEY: z.string(),
  PUSHER_SECRET: z.string(),
  PUSHER_CLUSTER: z.string(),
  NEXT_PUBLIC_PUSHER_KEY: z.string(),
  NEXT_PUBLIC_PUSHER_CLUSTER: z.string(),
  
  // Email
  SENDGRID_API_KEY: z.string().optional(),
  ZEPTO_API_KEY: z.string().optional(),
  
  // SMS
  THESMSWORKS_KEY: z.string().optional(),
  THESMSWORKS_SECRET: z.string().optional(),
  
  // Maps
  NEXT_PUBLIC_MAPBOX_TOKEN: z.string().optional(),
  
  // Weather
  NEXT_PUBLIC_WEATHER_API_KEY: z.string().optional(),
  
  // OpenAI - Removed (AI functionality deleted)
  
  // JWT
  JWT_SECRET: z.string(),
  
  // App
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000'),
  
  // Custom
  CUSTOM_KEY: z.string().optional(),
  LOG_LEVEL: z.string().default('info'),
  NEXT_PUBLIC_API_URL: z.string().url().optional(),
  NEXT_PUBLIC_BASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_COMPANY_NAME: z.string().optional(),
  NEXT_PUBLIC_COMPANY_ADDRESS: z.string().optional(),
  NEXT_PUBLIC_COMPANY_PHONE: z.string().optional(),
  NEXT_PUBLIC_COMPANY_EMAIL: z.string().optional(),
});

export const env = envSchema.parse(process.env);

export default env;