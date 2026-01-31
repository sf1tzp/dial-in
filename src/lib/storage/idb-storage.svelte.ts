import { browser } from '$app/environment';
import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { CoffeeBag, CoffeeBrew, SyncMetadata } from './interfaces';

// NOTE: idb cannot guarantee that data will not be evicted
// We should think about adding an export feature or implement
// serverside persistence
// https://github.com/jakearchibald/idb/issues/299

// Device ID for tracking which device made changes
const DEVICE_ID_KEY = 'dial-in-device-id';

/**
 * Get or create a unique device ID
 */
function getOrCreateDeviceId(): string {
    if (!browser) return 'server';

    let deviceId = localStorage.getItem(DEVICE_ID_KEY);
    if (!deviceId) {
        deviceId = crypto.randomUUID();
        localStorage.setItem(DEVICE_ID_KEY, deviceId);
    }
    return deviceId;
}

// Database schema definition
interface DialInDB extends DBSchema {
    coffeeBags: {
        key: string;
        value: CoffeeBag;
        indexes: {
            'by-created': Date;
            'by-dirty': number; // 1 for dirty, 0 for clean
            'by-synced': Date;
        };
    };
    coffeeBrews: {
        key: string;
        value: CoffeeBrew;
        indexes: {
            'by-created': Date;
            'by-bag': string;
            'by-dirty': number;
            'by-synced': Date;
        };
    };
}

const DB_NAME = 'dial-in-db';
const DB_VERSION = 2;

// Singleton database instance
let dbInstance: IDBPDatabase<DialInDB> | null = null;

/**
 * Get or initialize the database connection
 */
async function getDB(): Promise<IDBPDatabase<DialInDB>> {
    if (dbInstance) return dbInstance;

    dbInstance = await openDB<DialInDB>(DB_NAME, DB_VERSION, {
        upgrade(db, oldVersion, _newVersion, transaction) {
            // Version 1: Basic stores
            if (oldVersion < 1) {
                // Coffee Bags store
                const bagStore = db.createObjectStore('coffeeBags', {
                    keyPath: 'id',
                });
                bagStore.createIndex('by-created', 'createdAt');
                bagStore.createIndex('by-dirty', 'isDirty');
                bagStore.createIndex('by-synced', 'syncedAt');

                // Coffee Brews store
                const brewStore = db.createObjectStore('coffeeBrews', {
                    keyPath: 'id',
                });
                brewStore.createIndex('by-created', 'createdAt');
                brewStore.createIndex('by-bag', 'coffeeBagId');
                brewStore.createIndex('by-dirty', 'isDirty');
                brewStore.createIndex('by-synced', 'syncedAt');
            }

            // Version 2: Add sync metadata indexes to existing stores
            if (oldVersion >= 1 && oldVersion < 2) {
                // Add sync indexes to coffeeBags
                const bagStore = transaction.objectStore('coffeeBags');
                if (!bagStore.indexNames.contains('by-dirty')) {
                    bagStore.createIndex('by-dirty', 'isDirty');
                }
                if (!bagStore.indexNames.contains('by-synced')) {
                    bagStore.createIndex('by-synced', 'syncedAt');
                }

                // Add sync indexes to coffeeBrews
                const brewStore = transaction.objectStore('coffeeBrews');
                if (!brewStore.indexNames.contains('by-dirty')) {
                    brewStore.createIndex('by-dirty', 'isDirty');
                }
                if (!brewStore.indexNames.contains('by-synced')) {
                    brewStore.createIndex('by-synced', 'syncedAt');
                }
            }
        },
    });

    return dbInstance;
}

/**
 * Creates a reactive store backed by IndexedDB
 * The store maintains reactive state in memory and persists to IndexedDB
 */
function createIDBStore<
    T extends { id: string; createdAt: Date } & SyncMetadata,
>(storeName: 'coffeeBags' | 'coffeeBrews') {
    let items = $state<T[]>([]);
    let initialized = $state(false);

    // Load initial data from IndexedDB
    async function load(): Promise<void> {
        if (!browser) return;

        try {
            const db = await getDB();
            const all = (await db.getAll(storeName)) as unknown as T[];
            // Sort by createdAt descending (newest first)
            // Also migrate old items without sync metadata
            items = all
                .map(
                    (item) =>
                        ({
                            ...item,
                            deviceId: item.deviceId ?? getOrCreateDeviceId(),
                            syncedAt: item.syncedAt ?? null,
                            deletedAt: item.deletedAt ?? null,
                            isDirty: item.isDirty ?? true, // Assume dirty if not set
                        }) as T
                )
                .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
            initialized = true;
        } catch (error) {
            console.error(`Failed to load ${storeName} from IndexedDB:`, error);
            initialized = true; // Mark as initialized even on error to prevent blocking
        }
    }

    return {
        /**
         * Get all non-deleted items (for UI display)
         */
        get items() {
            return items.filter((item) => !item.deletedAt);
        },

        /**
         * Get all items including soft-deleted ones (for sync)
         */
        get allItems() {
            return items;
        },

        get initialized() {
            return initialized;
        },

        /**
         * Get items that have been modified since last sync (excludes deleted)
         */
        getDirtyItems(): T[] {
            return items.filter((item) => item.isDirty && !item.deletedAt);
        },

        /**
         * Get items that have been soft-deleted and need to be synced
         */
        getDeletedDirtyItems(): T[] {
            return items.filter((item) => item.isDirty && item.deletedAt);
        },

        /**
         * Remove all soft-deleted items that have been synced
         * Call this after successful sync to clean up
         */
        async cleanupSyncedDeletes(): Promise<void> {
            const toCleanup = items.filter(
                (item) => item.deletedAt && !item.isDirty
            );

            if (toCleanup.length === 0) return;

            // Update reactive state immediately
            items = items.filter((item) => !item.deletedAt || item.isDirty);

            if (!browser) return;

            try {
                const db = await getDB();
                const tx = db.transaction(storeName, 'readwrite');
                await Promise.all(
                    toCleanup.map((item) => tx.store.delete(item.id))
                );
                await tx.done;
            } catch (error) {
                console.error(
                    `Failed to cleanup synced deletes in ${storeName}:`,
                    error
                );
            }
        },

        /**
         * Initialize the store by loading data from IndexedDB
         */
        load,

        /**
         * Add a new item to the store
         * Sync metadata fields are optional and will be set to defaults if not provided
         */
        async add(
            item: Omit<T, keyof SyncMetadata> & Partial<SyncMetadata>
        ): Promise<void> {
            // Ensure sync metadata is set and mark as dirty
            const itemWithMeta = {
                ...item,
                deviceId: item.deviceId ?? getOrCreateDeviceId(),
                syncedAt: item.syncedAt ?? null,
                deletedAt: item.deletedAt ?? null,
                isDirty: item.isDirty ?? true,
            } as T;

            // Update reactive state immediately for responsive UI
            items = [itemWithMeta, ...items];

            if (!browser) return;

            try {
                const db = await getDB();
                await db.add(
                    storeName,
                    itemWithMeta as T & CoffeeBag & CoffeeBrew
                );
            } catch (error) {
                console.error(`Failed to add item to ${storeName}:`, error);
                // Rollback on error
                items = items.filter((i) => i.id !== item.id);
                throw error;
            }
        },

        /**
         * Update an existing item
         */
        async update(id: string, updates: Partial<T>): Promise<void> {
            const index = items.findIndex((item) => item.id === id);
            if (index === -1) return;

            const original = items[index];
            const updated = {
                ...original,
                ...updates,
                updatedAt: new Date(),
                isDirty: true, // Mark as dirty on update
                deviceId: getOrCreateDeviceId(),
            } as T;

            // Update reactive state immediately
            items = items.map((item) => (item.id === id ? updated : item));

            if (!browser) return;

            try {
                const db = await getDB();
                await db.put(storeName, updated as T & CoffeeBag & CoffeeBrew);
            } catch (error) {
                console.error(`Failed to update item in ${storeName}:`, error);
                // Rollback on error
                items = items.map((item) => (item.id === id ? original : item));
                throw error;
            }
        },

        /**
         * Remove an item from the store (soft delete for sync)
         * Marks the item as deleted but keeps it for sync purposes
         */
        async remove(id: string): Promise<void> {
            const original = items.find((item) => item.id === id);
            if (!original) return;

            const now = new Date();
            const softDeleted = {
                ...original,
                deletedAt: now,
                updatedAt: now,
                isDirty: true,
                deviceId: getOrCreateDeviceId(),
            } as T;

            // Update reactive state immediately - soft deleted items are filtered from view
            items = items.map((item) => (item.id === id ? softDeleted : item));

            if (!browser) return;

            try {
                const db = await getDB();
                await db.put(
                    storeName,
                    softDeleted as T & CoffeeBag & CoffeeBrew
                );
            } catch (error) {
                console.error(
                    `Failed to soft delete item from ${storeName}:`,
                    error
                );
                // Rollback on error
                items = items.map((item) => (item.id === id ? original : item));
                throw error;
            }
        },

        /**
         * Hard delete an item from the store (removes from IndexedDB completely)
         * Use this after sync confirms the deletion was processed
         */
        async hardDelete(id: string): Promise<void> {
            const original = items.find((item) => item.id === id);
            if (!original) return;

            // Update reactive state immediately
            items = items.filter((item) => item.id !== id);

            if (!browser) return;

            try {
                const db = await getDB();
                await db.delete(storeName, id);
            } catch (error) {
                console.error(
                    `Failed to hard delete item from ${storeName}:`,
                    error
                );
                // Rollback on error - insert back at original position
                items = [...items, original].sort(
                    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
                );
                throw error;
            }
        },

        /**
         * Get an item by ID
         */
        getById(id: string): T | undefined {
            return items.find((item) => item.id === id);
        },

        /**
         * Clear all items from the store
         */
        async clear(): Promise<void> {
            const original = [...items];
            items = [];

            if (!browser) return;

            try {
                const db = await getDB();
                await db.clear(storeName);
            } catch (error) {
                console.error(`Failed to clear ${storeName}:`, error);
                // Rollback on error
                items = original;
                throw error;
            }
        },

        /**
         * Replace all items (useful for importing data)
         */
        async setAll(newItems: T[]): Promise<void> {
            const original = [...items];
            items = newItems.sort(
                (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
            );

            if (!browser) return;

            try {
                const db = await getDB();
                const tx = db.transaction(storeName, 'readwrite');
                await tx.store.clear();
                await Promise.all(
                    newItems.map((item) =>
                        tx.store.add(item as T & CoffeeBag & CoffeeBrew)
                    )
                );
                await tx.done;
            } catch (error) {
                console.error(
                    `Failed to set all items in ${storeName}:`,
                    error
                );
                // Rollback on error
                items = original;
                throw error;
            }
        },

        /**
         * Mark items as synced (called after successful push)
         */
        async markAsSynced(ids: string[]): Promise<void> {
            const now = new Date();
            const idsSet = new Set(ids);

            // Update in-memory state
            items = items.map((item) =>
                idsSet.has(item.id)
                    ? { ...item, isDirty: false, syncedAt: now }
                    : item
            );

            if (!browser) return;

            try {
                const db = await getDB();
                const tx = db.transaction(storeName, 'readwrite');
                await Promise.all(
                    ids.map(async (id) => {
                        const item = await tx.store.get(id);
                        if (item) {
                            await tx.store.put({
                                ...item,
                                isDirty: false,
                                syncedAt: now,
                            } as T & CoffeeBag & CoffeeBrew);
                        }
                    })
                );
                await tx.done;
            } catch (error) {
                console.error(
                    `Failed to mark items as synced in ${storeName}:`,
                    error
                );
            }
        },

        /**
         * Mark item as synced after receiving from server (no dirty flag change needed)
         */
        async upsertFromRemote(item: T): Promise<void> {
            const existing = items.find((i) => i.id === item.id);
            const syncedItem = {
                ...item,
                isDirty: false,
                syncedAt: new Date(),
            };

            if (existing) {
                items = items.map((i) => (i.id === item.id ? syncedItem : i));
            } else {
                items = [syncedItem, ...items].sort(
                    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
                );
            }

            if (!browser) return;

            try {
                const db = await getDB();
                await db.put(
                    storeName,
                    syncedItem as T & CoffeeBag & CoffeeBrew
                );
            } catch (error) {
                console.error(
                    `Failed to upsert from remote in ${storeName}:`,
                    error
                );
                throw error;
            }
        },
    };
}

// Create the stores
export const coffeeBagStore = createIDBStore<CoffeeBag>('coffeeBags');
export const coffeeBrewStore = createIDBStore<CoffeeBrew>('coffeeBrews');

/**
 * Initialize all stores - call this once at app startup
 */
export async function initializeStores(): Promise<void> {
    await Promise.all([coffeeBagStore.load(), coffeeBrewStore.load()]);
}

/**
 * Helper to get brews for a specific bag
 * Uses the in-memory reactive state for quick access
 */
export function getBrewsForBag(bagId: string): CoffeeBrew[] {
    return coffeeBrewStore.items.filter((brew) => brew.coffeeBagId === bagId);
}

/**
 * Helper to get brews for a specific bag directly from IndexedDB
 * Use this when you need fresh data and don't want to rely on in-memory state
 */
export async function getBrewsForBagFromDB(
    bagId: string
): Promise<CoffeeBrew[]> {
    if (!browser) return [];

    try {
        const db = await getDB();
        return db.getAllFromIndex('coffeeBrews', 'by-bag', bagId);
    } catch (error) {
        console.error('Failed to get brews for bag from IndexedDB:', error);
        return [];
    }
}

/**
 * Helper to clear all stored data
 */
export async function clearAllData(): Promise<void> {
    await Promise.all([coffeeBagStore.clear(), coffeeBrewStore.clear()]);
}
