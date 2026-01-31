/**
 * Client-side sync service for local-first data synchronization
 * Orchestrates bidirectional sync between IndexedDB and PostgreSQL
 */

import { browser } from '$app/environment';
import { authClient } from '$lib/auth-client';
import type { CoffeeBag, CoffeeBrew } from '$lib/storage/interfaces';
import { coffeeBagStore, coffeeBrewStore } from '$lib/storage';

// Device ID for tracking which device made changes
const DEVICE_ID_KEY = 'dial-in-device-id';
const LAST_SYNC_KEY = 'dial-in-last-sync';

// Sync status for UI visibility
export interface SyncStatus {
    lastSyncTime: Date | null;
    isSyncing: boolean;
    lastError: string | null;
    lastPullResults: { bags: number; brews: number; deleted: number } | null;
    lastPushResults: { bags: number; brews: number; deleted: number } | null;
}

/**
 * Get or create a unique device ID
 */
function getDeviceId(): string {
    if (!browser) return 'server';

    let deviceId = localStorage.getItem(DEVICE_ID_KEY);
    if (!deviceId) {
        deviceId = crypto.randomUUID();
        localStorage.setItem(DEVICE_ID_KEY, deviceId);
    }
    return deviceId;
}

/**
 * Get the timestamp of the last successful sync
 */
function getLastSyncTime(): number | null {
    if (!browser) return null;

    const stored = localStorage.getItem(LAST_SYNC_KEY);
    return stored ? parseInt(stored, 10) : null;
}

/**
 * Save the timestamp of the last successful sync
 */
function setLastSyncTime(timestamp: number): void {
    if (!browser) return;
    localStorage.setItem(LAST_SYNC_KEY, timestamp.toString());
}

/**
 * Sync response types from the server
 */
interface SyncPullResponse {
    success: boolean;
    data: {
        coffeeBags: RemoteCoffeeBag[];
        coffeeBrews: RemoteCoffeeBrew[];
    };
    serverTime: number;
}

interface SyncPushResponse {
    success: boolean;
    results: {
        coffeeBags: { created: number; updated: number; conflicts: number };
        coffeeBrews: { created: number; updated: number; conflicts: number };
    };
    serverTime: number;
}

// Remote types - standalone definitions to avoid conflicts with local SyncMetadata
interface RemoteCoffeeBag {
    id: string;
    name: string;
    roasterName: string;
    style: string;
    notes: string;
    picture?: string;
    dateRoasted: string | null;
    dateOpened: string | null;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    syncedAt: string | null;
    userId: string;
    deviceId: string;
}

interface RemoteCoffeeBrew {
    id: string;
    coffeeBagId: string;
    grindSetting: number;
    dryWeight: number;
    brewTime: number;
    pressureReading: number;
    notes?: string;
    picture?: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    syncedAt: string | null;
    userId: string;
    deviceId: string;
}

/**
 * Convert remote coffee bag to local format
 */
function remoteBagToLocal(remote: RemoteCoffeeBag): CoffeeBag {
    return {
        id: remote.id,
        name: remote.name,
        roasterName: remote.roasterName,
        style: remote.style,
        notes: remote.notes,
        picture: remote.picture ?? undefined,
        dateRoasted: remote.dateRoasted
            ? new Date(remote.dateRoasted)
            : undefined,
        dateOpened: remote.dateOpened ? new Date(remote.dateOpened) : undefined,
        createdAt: new Date(remote.createdAt),
        updatedAt: new Date(remote.updatedAt),
        // Sync metadata
        deviceId: remote.deviceId,
        syncedAt: remote.syncedAt ? new Date(remote.syncedAt) : null,
        deletedAt: remote.deletedAt ? new Date(remote.deletedAt) : null,
        isDirty: false, // Coming from server, not dirty
    };
}

/**
 * Convert remote coffee brew to local format
 */
function remoteBrewToLocal(remote: RemoteCoffeeBrew): CoffeeBrew {
    return {
        id: remote.id,
        coffeeBagId: remote.coffeeBagId,
        grindSetting: remote.grindSetting,
        dryWeight: remote.dryWeight,
        brewTime: remote.brewTime,
        pressureReading: remote.pressureReading,
        notes: remote.notes ?? undefined,
        picture: remote.picture ?? undefined,
        createdAt: new Date(remote.createdAt),
        updatedAt: new Date(remote.updatedAt),
        // Sync metadata
        deviceId: remote.deviceId,
        syncedAt: remote.syncedAt ? new Date(remote.syncedAt) : null,
        deletedAt: remote.deletedAt ? new Date(remote.deletedAt) : null,
        isDirty: false, // Coming from server, not dirty
    };
}

/**
 * Convert local coffee bag to remote format for push
 */
function localBagToRemote(
    local: CoffeeBag
): Omit<RemoteCoffeeBag, 'userId' | 'syncedAt'> {
    return {
        id: local.id,
        name: local.name,
        roasterName: local.roasterName,
        style: local.style,
        notes: local.notes,
        picture: typeof local.picture === 'string' ? local.picture : undefined,
        dateRoasted: local.dateRoasted?.toISOString() ?? null,
        dateOpened: local.dateOpened?.toISOString() ?? null,
        createdAt: local.createdAt.toISOString(),
        updatedAt: local.updatedAt.toISOString(),
        deletedAt: local.deletedAt?.toISOString() ?? null,
        deviceId: getDeviceId(),
    };
}

/**
 * Convert local coffee brew to remote format for push
 */
function localBrewToRemote(
    local: CoffeeBrew
): Omit<RemoteCoffeeBrew, 'userId' | 'syncedAt'> {
    return {
        id: local.id,
        coffeeBagId: local.coffeeBagId,
        grindSetting: local.grindSetting,
        dryWeight: local.dryWeight,
        brewTime: local.brewTime,
        pressureReading: local.pressureReading,
        notes: local.notes,
        picture: typeof local.picture === 'string' ? local.picture : undefined,
        createdAt: local.createdAt.toISOString(),
        updatedAt: local.updatedAt.toISOString(),
        deletedAt: local.deletedAt?.toISOString() ?? null,
        deviceId: getDeviceId(),
    };
}

/**
 * Merge remote entity into local using Last-Write-Wins
 */
function mergeEntity<T extends { id: string; updatedAt: Date }>(
    local: T | undefined,
    remote: T
): T | null {
    // If no local, use remote
    if (!local) return remote;

    // Remote is newer - use remote
    if (remote.updatedAt > local.updatedAt) {
        return remote;
    }

    // Local is newer or same - keep local (will be pushed)
    return null; // null means no update needed
}

/**
 * Sync Service class for managing synchronization
 */
class SyncService {
    private syncing = false;
    private autoSyncInterval: ReturnType<typeof setInterval> | null = null;

    // Reactive sync status using Svelte 5 runes
    private _status = $state<SyncStatus>({
        lastSyncTime: null,
        isSyncing: false,
        lastError: null,
        lastPullResults: null,
        lastPushResults: null,
    });

    /**
     * Get the current sync status (reactive)
     */
    get status(): SyncStatus {
        return this._status;
    }

    /**
     * Update sync status
     */
    private updateStatus(updates: Partial<SyncStatus>): void {
        this._status = { ...this._status, ...updates };
    }

    /**
     * Check if user is authenticated
     */
    private async isAuthenticated(): Promise<boolean> {
        if (!browser) return false;

        try {
            const response = await fetch('/api/sync/pull', {
                method: 'HEAD',
                credentials: 'include',
            });
            return response.ok;
        } catch {
            return false;
        }
    }

    /**
     * Pull changes from the server
     */
    async pull(): Promise<{ bags: number; brews: number; deleted: number }> {
        const lastSync = getLastSyncTime();
        const url = lastSync
            ? `/api/sync/pull?since=${lastSync}`
            : '/api/sync/pull';

        const response = await fetch(url, {
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error(`Pull failed: ${response.statusText}`);
        }

        const result: SyncPullResponse = await response.json();

        let bagsUpdated = 0;
        let brewsUpdated = 0;
        let deleted = 0;

        // Process coffee bags
        for (const remoteBag of result.data.coffeeBags) {
            // Handle soft deletes - use hardDelete since server already knows about deletion
            if (remoteBag.deletedAt) {
                const existing = coffeeBagStore.getById(remoteBag.id);
                if (existing) {
                    await coffeeBagStore.hardDelete(remoteBag.id);
                    deleted++;
                }
                continue;
            }

            const localBag = coffeeBagStore.getById(remoteBag.id);
            const converted = remoteBagToLocal(remoteBag);
            const merged = mergeEntity(localBag, converted);

            if (merged) {
                // Use upsertFromRemote to properly handle sync metadata
                await coffeeBagStore.upsertFromRemote(merged);
                bagsUpdated++;
            }
        }

        // Process coffee brews
        for (const remoteBrew of result.data.coffeeBrews) {
            // Handle soft deletes - use hardDelete since server already knows about deletion
            if (remoteBrew.deletedAt) {
                const existing = coffeeBrewStore.getById(remoteBrew.id);
                if (existing) {
                    await coffeeBrewStore.hardDelete(remoteBrew.id);
                    deleted++;
                }
                continue;
            }

            const localBrew = coffeeBrewStore.getById(remoteBrew.id);
            const converted = remoteBrewToLocal(remoteBrew);
            const merged = mergeEntity(localBrew, converted);

            if (merged) {
                // Use upsertFromRemote to properly handle sync metadata
                await coffeeBrewStore.upsertFromRemote(merged);
                brewsUpdated++;
            }
        }

        // Update last sync time
        setLastSyncTime(result.serverTime);

        return { bags: bagsUpdated, brews: brewsUpdated, deleted };
    }

    /**
     * Push local changes to the server
     * Only pushes items that have been modified since last sync (dirty items)
     * Includes soft-deleted items so deletions are synced
     */
    async push(): Promise<{ bags: number; brews: number; deleted: number }> {
        const deviceId = getDeviceId();

        // Get dirty items (modified) and deleted dirty items
        const dirtyBags = coffeeBagStore.getDirtyItems();
        const dirtyBrews = coffeeBrewStore.getDirtyItems();
        const deletedBags = coffeeBagStore.getDeletedDirtyItems();
        const deletedBrews = coffeeBrewStore.getDeletedDirtyItems();

        // Combine all items that need to be pushed
        const allDirtyBags = [...dirtyBags, ...deletedBags];
        const allDirtyBrews = [...dirtyBrews, ...deletedBrews];

        // If nothing to push, return early
        if (allDirtyBags.length === 0 && allDirtyBrews.length === 0) {
            console.log('No dirty items to push');
            return { bags: 0, brews: 0, deleted: 0 };
        }

        const coffeeBags = allDirtyBags.map(localBagToRemote);
        const coffeeBrews = allDirtyBrews.map(localBrewToRemote);

        console.log(
            `Pushing ${dirtyBags.length} bags, ${dirtyBrews.length} brews, and ${deletedBags.length + deletedBrews.length} deletions`
        );

        const response = await fetch('/api/sync/push', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                deviceId,
                coffeeBags,
                coffeeBrews,
            }),
        });

        if (!response.ok) {
            throw new Error(`Push failed: ${response.statusText}`);
        }

        const result: SyncPushResponse = await response.json();
        setLastSyncTime(result.serverTime);

        // Mark pushed items as synced
        if (allDirtyBags.length > 0) {
            await coffeeBagStore.markAsSynced(allDirtyBags.map((b) => b.id));
        }
        if (allDirtyBrews.length > 0) {
            await coffeeBrewStore.markAsSynced(allDirtyBrews.map((b) => b.id));
        }

        // Clean up soft-deleted items that have been synced
        await coffeeBagStore.cleanupSyncedDeletes();
        await coffeeBrewStore.cleanupSyncedDeletes();

        return {
            bags: dirtyBags.length,
            brews: dirtyBrews.length,
            deleted: deletedBags.length + deletedBrews.length,
        };
    }

    /**
     * Perform a full sync (pull then push)
     */
    async syncNow(): Promise<{
        pullResults: { bags: number; brews: number; deleted: number };
        pushResults: { bags: number; brews: number; deleted: number };
    } | null> {
        if (!browser) return null;

        // Check authentication
        const authenticated = await this.isAuthenticated();
        if (!authenticated) {
            console.log('Sync skipped: not authenticated');
            this.updateStatus({ lastError: 'Not authenticated' });
            return null;
        }

        // Prevent concurrent syncs
        if (this.syncing) {
            console.log('Sync already in progress');
            return null;
        }

        this.syncing = true;
        this.updateStatus({ isSyncing: true, lastError: null });

        try {
            console.log('Starting sync...');

            // Pull first to get latest server state
            const pullResults = await this.pull();
            console.log('Pull complete:', pullResults);

            // Then push local changes
            const pushResults = await this.push();
            console.log('Push complete:', pushResults);

            this.updateStatus({
                lastSyncTime: new Date(),
                lastPullResults: pullResults,
                lastPushResults: pushResults,
            });

            return { pullResults, pushResults };
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : 'Unknown error';
            console.error('Sync failed:', err);
            this.updateStatus({ lastError: errorMessage });
            throw err;
        } finally {
            this.syncing = false;
            this.updateStatus({ isSyncing: false });
        }
    }

    /**
     * Start automatic sync at regular intervals
     */
    startAutoSync(intervalMs: number = 30000): void {
        if (!browser) return;

        this.stopAutoSync();

        // Initial sync
        this.syncNow().catch(console.error);

        // Set up interval
        this.autoSyncInterval = setInterval(() => {
            this.syncNow().catch(console.error);
        }, intervalMs);

        // Sync on visibility change (tab becomes active)
        document.addEventListener(
            'visibilitychange',
            this.handleVisibilityChange
        );

        // Sync on network reconnect
        window.addEventListener('online', this.handleOnline);
    }

    /**
     * Stop automatic sync
     */
    stopAutoSync(): void {
        if (this.autoSyncInterval) {
            clearInterval(this.autoSyncInterval);
            this.autoSyncInterval = null;
        }

        if (browser) {
            document.removeEventListener(
                'visibilitychange',
                this.handleVisibilityChange
            );
            window.removeEventListener('online', this.handleOnline);
        }
    }

    private handleVisibilityChange = (): void => {
        if (document.visibilityState === 'visible') {
            this.syncNow().catch(console.error);
        }
    };

    private handleOnline = (): void => {
        this.syncNow().catch(console.error);
    };

    /**
     * Clear sync state (useful for logout)
     */
    clearSyncState(): void {
        if (!browser) return;

        localStorage.removeItem(LAST_SYNC_KEY);
        this.stopAutoSync();
    }
}

// Export singleton instance
export const syncService = new SyncService();
