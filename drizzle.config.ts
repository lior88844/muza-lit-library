import { defineConfig } from 'drizzle-kit'
import { config as dotenvConfig } from 'dotenv'

dotenvConfig()

export default defineConfig({
  schema: './server/db/*.entity.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  migrations: {
    table: '__drizzle_migrations', // `__drizzle_migrations` by default
    schema: 'public', // used in PostgreSQL only, `drizzle` by default
  },
  verbose: true,
  strict: true,
})
