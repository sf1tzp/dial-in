import { defineConfig } from 'drizzle-kit';
import { getDatabaseUrl, DEFAULT_DATABASE_URL } from './src/lib/server/db/connection';

export default defineConfig({
    schema: './src/lib/server/db/schema.ts',
    out: './drizzle',
    dialect: 'postgresql',
    dbCredentials: {
        url: process.env.DATABASE_URL || DEFAULT_DATABASE_URL,
    },
    verbose: true,
    strict: true,
});
