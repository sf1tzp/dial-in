import { defineConfig } from 'drizzle-kit';

// note: this config is used by drizzle-kit cli (npm run db:*)
// Since it does not run via sveltekit, we use standard enviornment variable handling here

export default defineConfig({
    schema: './src/lib/server/db/schema.ts',
    out: './drizzle',
    dialect: 'postgresql',
    dbCredentials: {
        url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/dial-in'
    }
});
