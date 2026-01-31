/**
 * Sync Push Endpoint
 * POST /api/sync/push
 *
 * Receives batch of changes from client and applies them to the database.
 * Uses Last-Write-Wins conflict resolution.
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
    batchUpsertCoffeeBags,
    batchUpsertCoffeeBrews,
    logSyncOperation,
} from '$lib/server/db/store';
import { auth } from '$lib/server/auth';
import type { CoffeeBagInsert, CoffeeBrewInsert } from '$lib/server/db/schema';

interface SyncPushPayload {
    deviceId: string;
    coffeeBags?: Array<Omit<CoffeeBagInsert, 'userId'>>;
    coffeeBrews?: Array<Omit<CoffeeBrewInsert, 'userId'>>;
}

export const POST: RequestHandler = async ({ request }) => {
    // Verify authentication
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
        throw error(401, 'Unauthorized');
    }

    const userId = session.user.id;

    let payload: SyncPushPayload;
    try {
        payload = await request.json();
    } catch {
        throw error(400, 'Invalid JSON payload');
    }

    // Validate payload
    if (!payload.deviceId) {
        throw error(400, 'deviceId is required');
    }

    const { deviceId, coffeeBags = [], coffeeBrews = [] } = payload;

    try {
        const results = {
            coffeeBags: { created: 0, updated: 0, conflicts: 0 },
            coffeeBrews: { created: 0, updated: 0, conflicts: 0 },
        };

        // Process coffee bags
        if (coffeeBags.length > 0) {
            // Add userId to each record
            const bagsWithUser: CoffeeBagInsert[] = coffeeBags.map((bag) => ({
                ...bag,
                userId,
                deviceId,
                // Ensure dates are Date objects
                createdAt: new Date(bag.createdAt),
                updatedAt: new Date(bag.updatedAt),
                dateRoasted: bag.dateRoasted ? new Date(bag.dateRoasted) : undefined,
                dateOpened: bag.dateOpened ? new Date(bag.dateOpened) : undefined,
                deletedAt: bag.deletedAt ? new Date(bag.deletedAt) : undefined,
                syncedAt: new Date(),
            }));

            results.coffeeBags = await batchUpsertCoffeeBags(bagsWithUser);

            // Log sync operations
            for (const bag of bagsWithUser) {
                await logSyncOperation(
                    userId,
                    deviceId,
                    'push',
                    'coffeeBag',
                    bag.id,
                    'success'
                );
            }
        }

        // Process coffee brews
        if (coffeeBrews.length > 0) {
            // Add userId to each record
            const brewsWithUser: CoffeeBrewInsert[] = coffeeBrews.map((brew) => ({
                ...brew,
                userId,
                deviceId,
                // Ensure dates are Date objects
                createdAt: new Date(brew.createdAt),
                updatedAt: new Date(brew.updatedAt),
                deletedAt: brew.deletedAt ? new Date(brew.deletedAt) : undefined,
                syncedAt: new Date(),
            }));

            results.coffeeBrews = await batchUpsertCoffeeBrews(brewsWithUser);

            // Log sync operations
            for (const brew of brewsWithUser) {
                await logSyncOperation(
                    userId,
                    deviceId,
                    'push',
                    'coffeeBrew',
                    brew.id,
                    'success'
                );
            }
        }

        return json({
            success: true,
            results,
            serverTime: Date.now(),
        });
    } catch (err) {
        console.error('Sync push error:', err);
        throw error(500, 'Failed to push sync data');
    }
};
