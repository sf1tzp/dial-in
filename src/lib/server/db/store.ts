/**
 * Server-side data store for remote persistence
 * Provides CRUD operations with user scoping and sync metadata
 */

import { db } from './connection';
import {
    coffeeBags,
    coffeeBrews,
    syncLog,
    type CoffeeBagInsert,
    type CoffeeBagRecord,
    type CoffeeBrewInsert,
    type CoffeeBrewRecord,
} from './schema';
import { eq, and, gt, isNull, or } from 'drizzle-orm';
import { uuidv7 } from 'uuidv7';

// ============================================
// Coffee Bags Operations
// ============================================

/**
 * Get all coffee bags for a user (excluding soft-deleted)
 */
export async function getCoffeeBags(userId: string): Promise<CoffeeBagRecord[]> {
    return db
        .select()
        .from(coffeeBags)
        .where(and(eq(coffeeBags.userId, userId), isNull(coffeeBags.deletedAt)));
}

/**
 * Get coffee bags modified since a given timestamp (for sync pull)
 * Includes soft-deleted items so client can remove them
 */
export async function getCoffeeBagsSince(
    userId: string,
    since: Date
): Promise<CoffeeBagRecord[]> {
    return db
        .select()
        .from(coffeeBags)
        .where(and(eq(coffeeBags.userId, userId), gt(coffeeBags.updatedAt, since)));
}

/**
 * Get a single coffee bag by ID
 */
export async function getCoffeeBagById(
    userId: string,
    id: string
): Promise<CoffeeBagRecord | undefined> {
    const results = await db
        .select()
        .from(coffeeBags)
        .where(and(eq(coffeeBags.id, id), eq(coffeeBags.userId, userId)));
    return results[0];
}

/**
 * Upsert a coffee bag (insert or update based on existence)
 * Returns the resulting record and whether it was created or updated
 */
export async function upsertCoffeeBag(
    data: CoffeeBagInsert
): Promise<{ record: CoffeeBagRecord; operation: 'created' | 'updated' | 'conflict' }> {
    const existing = await db
        .select()
        .from(coffeeBags)
        .where(eq(coffeeBags.id, data.id));

    if (existing.length === 0) {
        // Insert new record
        const result = await db.insert(coffeeBags).values(data).returning();
        return { record: result[0], operation: 'created' };
    }

    const existingRecord = existing[0];

    // Conflict resolution: Last Write Wins
    // If incoming data is newer, update the record
    if (data.updatedAt > existingRecord.updatedAt) {
        const result = await db
            .update(coffeeBags)
            .set({
                ...data,
                syncedAt: new Date(),
            })
            .where(eq(coffeeBags.id, data.id))
            .returning();
        return { record: result[0], operation: 'updated' };
    }

    // Server version is newer or same - return existing (conflict)
    return { record: existingRecord, operation: 'conflict' };
}

/**
 * Soft delete a coffee bag
 */
export async function softDeleteCoffeeBag(
    userId: string,
    id: string,
    deviceId: string
): Promise<CoffeeBagRecord | undefined> {
    const now = new Date();
    const result = await db
        .update(coffeeBags)
        .set({
            deletedAt: now,
            updatedAt: now,
            deviceId,
        })
        .where(and(eq(coffeeBags.id, id), eq(coffeeBags.userId, userId)))
        .returning();
    return result[0];
}

// ============================================
// Coffee Brews Operations
// ============================================

/**
 * Get all coffee brews for a user (excluding soft-deleted)
 */
export async function getCoffeeBrews(userId: string): Promise<CoffeeBrewRecord[]> {
    return db
        .select()
        .from(coffeeBrews)
        .where(and(eq(coffeeBrews.userId, userId), isNull(coffeeBrews.deletedAt)));
}

/**
 * Get coffee brews modified since a given timestamp (for sync pull)
 * Includes soft-deleted items so client can remove them
 */
export async function getCoffeeBrewsSince(
    userId: string,
    since: Date
): Promise<CoffeeBrewRecord[]> {
    return db
        .select()
        .from(coffeeBrews)
        .where(and(eq(coffeeBrews.userId, userId), gt(coffeeBrews.updatedAt, since)));
}

/**
 * Get brews for a specific coffee bag
 */
export async function getCoffeeBrewsForBag(
    userId: string,
    bagId: string
): Promise<CoffeeBrewRecord[]> {
    return db
        .select()
        .from(coffeeBrews)
        .where(
            and(
                eq(coffeeBrews.userId, userId),
                eq(coffeeBrews.coffeeBagId, bagId),
                isNull(coffeeBrews.deletedAt)
            )
        );
}

/**
 * Upsert a coffee brew (insert or update based on existence)
 */
export async function upsertCoffeeBrew(
    data: CoffeeBrewInsert
): Promise<{ record: CoffeeBrewRecord; operation: 'created' | 'updated' | 'conflict' }> {
    const existing = await db
        .select()
        .from(coffeeBrews)
        .where(eq(coffeeBrews.id, data.id));

    if (existing.length === 0) {
        // Insert new record
        const result = await db.insert(coffeeBrews).values(data).returning();
        return { record: result[0], operation: 'created' };
    }

    const existingRecord = existing[0];

    // Conflict resolution: Last Write Wins
    if (data.updatedAt > existingRecord.updatedAt) {
        const result = await db
            .update(coffeeBrews)
            .set({
                ...data,
                syncedAt: new Date(),
            })
            .where(eq(coffeeBrews.id, data.id))
            .returning();
        return { record: result[0], operation: 'updated' };
    }

    // Server version is newer or same - return existing (conflict)
    return { record: existingRecord, operation: 'conflict' };
}

/**
 * Soft delete a coffee brew
 */
export async function softDeleteCoffeeBrew(
    userId: string,
    id: string,
    deviceId: string
): Promise<CoffeeBrewRecord | undefined> {
    const now = new Date();
    const result = await db
        .update(coffeeBrews)
        .set({
            deletedAt: now,
            updatedAt: now,
            deviceId,
        })
        .where(and(eq(coffeeBrews.id, id), eq(coffeeBrews.userId, userId)))
        .returning();
    return result[0];
}

// ============================================
// Sync Operations
// ============================================

/**
 * Log a sync operation for auditing
 */
export async function logSyncOperation(
    userId: string,
    deviceId: string,
    operation: 'push' | 'pull',
    entityType: 'coffeeBag' | 'coffeeBrew',
    entityId: string,
    status: 'success' | 'conflict' | 'error',
    details?: string
): Promise<void> {
    await db.insert(syncLog).values({
        id: uuidv7(),
        userId,
        deviceId,
        operation,
        entityType,
        entityId,
        timestamp: new Date(),
        status,
        details,
    });
}

/**
 * Batch upsert for efficient sync operations
 */
export async function batchUpsertCoffeeBags(
    items: CoffeeBagInsert[]
): Promise<{ created: number; updated: number; conflicts: number }> {
    let created = 0;
    let updated = 0;
    let conflicts = 0;

    for (const item of items) {
        const result = await upsertCoffeeBag(item);
        switch (result.operation) {
            case 'created':
                created++;
                break;
            case 'updated':
                updated++;
                break;
            case 'conflict':
                conflicts++;
                break;
        }
    }

    return { created, updated, conflicts };
}

/**
 * Batch upsert for coffee brews
 */
export async function batchUpsertCoffeeBrews(
    items: CoffeeBrewInsert[]
): Promise<{ created: number; updated: number; conflicts: number }> {
    let created = 0;
    let updated = 0;
    let conflicts = 0;

    for (const item of items) {
        const result = await upsertCoffeeBrew(item);
        switch (result.operation) {
            case 'created':
                created++;
                break;
            case 'updated':
                updated++;
                break;
            case 'conflict':
                conflicts++;
                break;
        }
    }

    return { created, updated, conflicts };
}

/**
 * Get all data for initial sync (first time sync for a user/device)
 */
export async function getFullSyncData(userId: string): Promise<{
    coffeeBags: CoffeeBagRecord[];
    coffeeBrews: CoffeeBrewRecord[];
}> {
    const [bags, brews] = await Promise.all([
        getCoffeeBags(userId),
        getCoffeeBrews(userId),
    ]);

    return { coffeeBags: bags, coffeeBrews: brews };
}

/**
 * Get incremental sync data (changes since last sync)
 */
export async function getIncrementalSyncData(
    userId: string,
    since: Date
): Promise<{
    coffeeBags: CoffeeBagRecord[];
    coffeeBrews: CoffeeBrewRecord[];
}> {
    const [bags, brews] = await Promise.all([
        getCoffeeBagsSince(userId, since),
        getCoffeeBrewsSince(userId, since),
    ]);

    return { coffeeBags: bags, coffeeBrews: brews };
}
