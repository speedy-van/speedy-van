import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DEEPSEEK_API_KEY: z.string().min(20, "Missing DEEPSEEK_API_KEY"),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("info"),
  RUNTIME: z.enum(["edge", "node"]).default("node"),
  
  // Database Configuration
  DATABASE_URL: z.string().url("Invalid DATABASE_URL"),
  
  // Agent Configuration
  AGENT_LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("info"),
  AGENT_MAX_CONVERSATION_LENGTH: z.coerce.number().min(1).max(1000).default(50),
  AGENT_RESPONSE_TIMEOUT: z.coerce.number().min(1000).max(60000).default(30000),
  
  // Company Information
  NEXT_PUBLIC_COMPANY_NAME: z.string().default("Speedy Van"),
  NEXT_PUBLIC_COMPANY_ADDRESS: z.string().default("140 Charles Street, Glasgow City, G21 2QB"),
  NEXT_PUBLIC_COMPANY_PHONE: z.string().default("+44 7901846297"),
  NEXT_PUBLIC_COMPANY_EMAIL: z.string().email().default("support@speedy-van.co.uk"),
  
  // Application Configuration
  NEXT_PUBLIC_BASE_URL: z.string().url().default("http://localhost:3000"),
  PORT: z.coerce.number().min(1).max(65535).default(3000),
  
  // Security
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  NEXTAUTH_SECRET: z.string().min(32, "NEXTAUTH_SECRET must be at least 32 characters"),
  
  // External Services
  STRIPE_SECRET_KEY: z.string().startsWith("sk_", "Invalid Stripe secret key"),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().startsWith("pk_", "Invalid Stripe publishable key"),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith("whsec_", "Invalid Stripe webhook secret"),
  
  // RAG Configuration
  RAG_CHUNK_SIZE: z.coerce.number().min(100).max(2000).default(512),
  RAG_CHUNK_OVERLAP: z.coerce.number().min(0).max(500).default(100),
  RAG_MAX_TOKENS: z.coerce.number().min(1000).max(10000).default(4000),
  
  // Rate Limiting
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().min(1).max(1000).default(100),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().min(1000).max(3600000).default(60000),
});

export type Env = z.infer<typeof EnvSchema>;

// Safe client-side defaults
const clientDefaults: Env = {
  NODE_ENV: "development" as const,
  DEEPSEEK_API_KEY: "",
  LOG_LEVEL: "info" as const,
  RUNTIME: "node" as const,
  DATABASE_URL: "",
  AGENT_LOG_LEVEL: "info" as const,
  AGENT_MAX_CONVERSATION_LENGTH: 50,
  AGENT_RESPONSE_TIMEOUT: 30000,
  NEXT_PUBLIC_COMPANY_NAME: "Speedy Van",
  NEXT_PUBLIC_COMPANY_ADDRESS: "140 Charles Street, Glasgow City, G21 2QB",
  NEXT_PUBLIC_COMPANY_PHONE: "+44 7901846297",
  NEXT_PUBLIC_COMPANY_EMAIL: "support@speedy-van.co.uk",
  NEXT_PUBLIC_BASE_URL: "http://localhost:3000",
  PORT: 3000,
  JWT_SECRET: "",
  NEXTAUTH_SECRET: "",
  STRIPE_SECRET_KEY: "",
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: "",
  STRIPE_WEBHOOK_SECRET: "",
  RAG_CHUNK_SIZE: 512,
  RAG_CHUNK_OVERLAP: 100,
  RAG_MAX_TOKENS: 4000,
  RATE_LIMIT_MAX_REQUESTS: 100,
  RATE_LIMIT_WINDOW_MS: 60000,
};

// Environment configuration with safe fallbacks
export const env: Env = (() => {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined') {
    return clientDefaults;
  }

  // Check if we're in a Next.js client-side context
  if (typeof process === 'undefined' || !process.env) {
    return clientDefaults;
  }

  try {
    const parsed = EnvSchema.parse(process.env);
    
    // Server-side logging (only in development)
    if (parsed.NODE_ENV === "development") {
      console.log(`Environment loaded: ${parsed.NODE_ENV}`);
      console.log(`Log level: ${parsed.LOG_LEVEL}`);
      console.log(`Runtime: ${parsed.RUNTIME}`);
      console.log(`Agent timeout: ${parsed.AGENT_RESPONSE_TIMEOUT}ms`);
      console.log(`RAG chunk size: ${parsed.RAG_CHUNK_SIZE} tokens`);
    }

    // Production validation
    if (parsed.NODE_ENV === "production") {
      if (!parsed.DEEPSEEK_API_KEY || parsed.DEEPSEEK_API_KEY.length < 20) {
        throw new Error("DEEPSEEK_API_KEY is required in production");
      }
      if (!parsed.DATABASE_URL) {
        throw new Error("DATABASE_URL is required in production");
      }
      if (!parsed.JWT_SECRET || parsed.JWT_SECRET.length < 32) {
        throw new Error("JWT_SECRET is required in production");
      }
    }

    return parsed;
  } catch (error) {
    // Safe error handling without accessing potentially undefined properties
    let errorMessage = "Environment validation failed";
    
    if (error instanceof z.ZodError) {
      try {
        const missingVars = error.issues.map(e => e.path.join('.')).join(', ');
        errorMessage = `Environment validation failed. Missing or invalid variables: ${missingVars}`;
      } catch {
        errorMessage = "Environment validation failed. Unable to parse error details.";
      }
    }
    
    // In development, throw the error; in production, use defaults
    if (process.env.NODE_ENV === "development") {
      throw new Error(errorMessage);
    }
    
    console.warn(errorMessage);
    return clientDefaults;
  }
})();
