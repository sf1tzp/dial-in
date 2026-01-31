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

// Remote types include sync metadata
interface RemoteCoffeeBag extends Omit<
    CoffeeBag,
    'dateRoasted' | 'dateOpened' | 'createdAt' | 'updatedAt'
> {
    dateRoasted: string | null;
    dateOpened: string | null;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    syncedAt: string | null;
    userId: string;
    deviceId: string;
}

interface RemoteCoffeeBrew extends Omit<CoffeeBrew, 'createdAt' | 'updatedAt'> {
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
        deletedAt: null,
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
        deletedAt: null,
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
            // Handle soft deletes
            if (remoteBag.deletedAt) {
                const existing = coffeeBagStore.getById(remoteBag.id);
                if (existing) {
                    await coffeeBagStore.remove(remoteBag.id);
                    deleted++;
                }
                continue;
            }

            const localBag = coffeeBagStore.getById(remoteBag.id);
            const converted = remoteBagToLocal(remoteBag);
            const merged = mergeEntity(localBag, converted);

            if (merged) {
                if (localBag) {
                    await coffeeBagStore.update(merged.id, merged);
                } else {
                    await coffeeBagStore.add(merged);
                }
                bagsUpdated++;
            }
        }

        // Process coffee brews
        for (const remoteBrew of result.data.coffeeBrews) {
            // Handle soft deletes
            if (remoteBrew.deletedAt) {
                const existing = coffeeBrewStore.getById(remoteBrew.id);
                if (existing) {
                    await coffeeBrewStore.remove(remoteBrew.id);
                    deleted++;
                }
                continue;
            }

            const localBrew = coffeeBrewStore.getById(remoteBrew.id);
            const converted = remoteBrewToLocal(remoteBrew);
            const merged = mergeEntity(localBrew, converted);

            if (merged) {
                if (localBrew) {
                    await coffeeBrewStore.update(merged.id, merged);
                } else {
                    await coffeeBrewStore.add(merged);
                }
                brewsUpdated++;
            }
        }

        // Update last sync time
        setLastSyncTime(result.serverTime);

        return { bags: bagsUpdated, brews: brewsUpdated, deleted };
    }

    /**
     * Push local changes to the server
     */
    async push(): Promise<SyncPushResponse['results']> {
        const deviceId = getDeviceId();

        // For now, push all local data
        // In a more sophisticated implementation, we'd track which items
        // have changed since last sync using a sync queue
        const coffeeBags = coffeeBagStore.items.map(localBagToRemote);
        const coffeeBrews = coffeeBrewStore.items.map(localBrewToRemote);

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

        return result.results;
    }

    /**
     * Perform a full sync (pull then push)
     */
    async syncNow(): Promise<{
        pullResults: { bags: number; brews: number; deleted: number };
        pushResults: SyncPushResponse['results'];
    } | null> {
        if (!browser) return null;

        // Check authentication
        const authenticated = await this.isAuthenticated();
        if (!authenticated) {
            console.log('Sync skipped: not authenticated');
            return null;
        }

        // Prevent concurrent syncs
        if (this.syncing) {
            console.log('Sync already in progress');
            return null;
        }

        this.syncing = true;

        try {
            console.log('Starting sync...');

            // Pull first to get latest server state
            const pullResults = await this.pull();
            console.log('Pull complete:', pullResults);

            // Then push local changes
            const pushResults = await this.push();
            console.log('Push complete:', pushResults);

            return { pullResults, pushResults };
        } catch (err) {
            console.error('Sync failed:', err);
            throw err;
        } finally {
            this.syncing = false;
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
