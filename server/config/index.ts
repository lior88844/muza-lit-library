import { config as dotenvConfig } from "dotenv";
import { z } from "zod";

// Load environment variables
dotenvConfig();

// Configuration schema
const ConfigSchema = z.object({
  // Server configuration
  NODE_ENV: z
    .enum(["development", "production", "staging"])
    .default("development"),
  HOST: z.string().default("localhost"),
  PORT: z.coerce.number().default(3000),
  AWS_REGION: z.string().default("us-east-1"),
  // Database configuration
  DATABASE_URL: z.string().min(1),

  // CORS configuration
  CORS_ORIGIN: z
    .string()
    .default("http://localhost:3000,http://localhost:5173"),

  // AWS configuration
  // AWS credentials (optional - for development only)
  // These will override your default AWS profile when set in development mode

  CDN_DOMAIN_NAME: z.string(),

  // AWS Cognito configuration
  COGNITO_USER_POOL_ID: z.string().min(1),
  COGNITO_CLIENT_ID: z.string().min(1),
  COGNITO_REGION: z.string().default("us-east-1"),
  // Logging configuration
  LOG_LEVEL: z.enum(["error", "warn", "info", "debug"]).default("info"),
});

// Parse and validate configuration
const configResult = ConfigSchema.safeParse(process.env);

if (!configResult.success) {
  console.error("❌ Configuration validation failed:");
  console.error(configResult.error.format());
  process.exit(1);
}

export const config = {
  ...configResult.data,
  // Derived configurations
  cors: {
    // origin: configResult.data.CORS_ORIGIN.split(',').map(origin =>
    //   origin.trim()
    // ),
    origin: "*",
  },
  cognito: {
    jwksUri: `https://cognito-idp.${configResult.data.COGNITO_REGION}.amazonaws.com/${configResult.data.COGNITO_USER_POOL_ID}/.well-known/jwks.json`,
  },
};

// Log configuration in development
if (config.NODE_ENV === "development") {
  console.log("🔧 Configuration loaded:", {
    NODE_ENV: config.NODE_ENV,
    HOST: config.HOST,
    PORT: config.PORT,
    DATABASE_URL: config.DATABASE_URL.replace(/:[^:@]*@/, ":***@"), // Hide passw
    COGNITO_USER_POOL_ID: config.COGNITO_USER_POOL_ID,
    AWS_REGION: config.AWS_REGION,
  });
}
