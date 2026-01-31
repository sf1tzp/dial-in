/**
 * Sync Pull Endpoint
 * GET /api/sync/pull?since=<timestamp>
 *
 * Returns all changes since the given timestamp.
 * If no timestamp provided, returns all data (initial sync).
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getFullSyncData, getIncrementalSyncData } from '$lib/server/db/store';

/**
 * HEAD request for auth check
 */
export const HEAD: RequestHandler = async ({ locals }) => {
    if (!locals.user) {
        throw error(401, 'Unauthorized');
    }

    return new Response(null, { status: 200 });
};

export const GET: RequestHandler = async ({ locals, url }) => {
    if (!locals.user) {
        throw error(401, 'Unauthorized');
    }

    const userId = locals.user.id;
    const sinceParam = url.searchParams.get('since');

    try {
        let data;

        if (sinceParam) {
            // Incremental sync - get changes since timestamp
            const since = new Date(parseInt(sinceParam, 10));

            if (isNaN(since.getTime())) {
                throw error(400, 'Invalid "since" parameter. Expected timestamp in milliseconds.');
            }

            data = await getIncrementalSyncData(userId, since);
        } else {
            // Full sync - get all data
            data = await getFullSyncData(userId);
        }

        return json({
            success: true,
            data,
            serverTime: Date.now(), // Client can use this for next sync
        });
    } catch (err) {
        console.error('Sync pull error:', err);

        if (err instanceof Error && 'status' in err) {
            throw err; // Re-throw HTTP errors
        }

        throw error(500, 'Failed to fetch sync data');
    }
};
