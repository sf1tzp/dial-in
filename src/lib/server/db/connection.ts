/**
 * PostgreSQL database connection using Drizzle ORM
 * Configure via environment variables:
 * - dial-in_DATABASE_URL: Full connection string (preferred)
 * - or individual: DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
 */

import { env } from '$env/dynamic/private';

import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from '$lib/server/db/schema';

const { Pool } = pg;

export const DEFAULT_DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/dial-in'

export function getDatabaseUrl(): string {
    return env.DATABASE_URL || DEFAULT_DATABASE_URL;
}

function getConnectionConfig() {
	// Prefer dial-in_DATABASE_URL if available
	if (env.DATABASE_URL) {
		return { connectionString: env.DATABASE_URL };
	}

	// Fall back to individual env vars
	return {
		host: env.DB_HOST || 'localhost',
		port: parseInt(env.DB_PORT || '5432', 10),
		database: env.DB_NAME || 'dial-in',
		user: env.DB_USER || 'postgres',
		password: env.DB_PASSWORD || 'postgres'
	};
}

// Create connection pool
const pool = new Pool(getConnectionConfig());

// Create Drizzle instance with schema
export const db = drizzle(pool, { schema });

// Export pool for direct access if needed
export { pool };

// Graceful shutdown helper
export async function closeConnection(): Promise<void> {
	await pool.end();
}
