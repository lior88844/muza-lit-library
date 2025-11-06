import { defineConfig } from 'drizzle-kit'
import { config as dotenvConfig } from 'dotenv'

dotenvConfig()

export default defineConfig({
  schema: './server/db/*.entity.ts',
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
})
