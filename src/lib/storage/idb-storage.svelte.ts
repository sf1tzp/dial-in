import { browser } from "$app/environment";
import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { CoffeeBag, CoffeeBrew } from "./interfaces";

// Database schema definition
interface DialInDB extends DBSchema {
  coffeeBags: {
    key: string;
    value: CoffeeBag;
    indexes: { "by-created": Date };
  };
  coffeeBrews: {
    key: string;
    value: CoffeeBrew;
    indexes: {
      "by-created": Date;
      "by-bag": string;
    };
  };
}

const DB_NAME = "dial-in-db";
const DB_VERSION = 1;

// Singleton database instance
let dbInstance: IDBPDatabase<DialInDB> | null = null;

/**
 * Get or initialize the database connection
 */
async function getDB(): Promise<IDBPDatabase<DialInDB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<DialInDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Coffee Bags store
      if (!db.objectStoreNames.contains("coffeeBags")) {
        const bagStore = db.createObjectStore("coffeeBags", { keyPath: "id" });
        bagStore.createIndex("by-created", "createdAt");
      }

      // Coffee Brews store
      if (!db.objectStoreNames.contains("coffeeBrews")) {
        const brewStore = db.createObjectStore("coffeeBrews", {
          keyPath: "id",
        });
        brewStore.createIndex("by-created", "createdAt");
        brewStore.createIndex("by-bag", "coffeeBagId");
      }
    },
  });

  return dbInstance;
}

/**
 * Creates a reactive store backed by IndexedDB
 * The store maintains reactive state in memory and persists to IndexedDB
 */
function createIDBStore<T extends { id: string; createdAt: Date }>(
  storeName: "coffeeBags" | "coffeeBrews",
) {
  let items = $state<T[]>([]);
  let initialized = $state(false);

  // Load initial data from IndexedDB
  async function load(): Promise<void> {
    if (!browser) return;

    try {
      const db = await getDB();
      const all = (await db.getAll(storeName)) as unknown as T[];
      // Sort by createdAt descending (newest first)
      items = all.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      initialized = true;
    } catch (error) {
      console.error(`Failed to load ${storeName} from IndexedDB:`, error);
      initialized = true; // Mark as initialized even on error to prevent blocking
    }
  }

  return {
    get items() {
      return items;
    },

    get initialized() {
      return initialized;
    },

    /**
     * Initialize the store by loading data from IndexedDB
     */
    load,

    /**
     * Add a new item to the store
     */
    async add(item: T): Promise<void> {
      // Update reactive state immediately for responsive UI
      items = [item, ...items];

      if (!browser) return;

      try {
        const db = await getDB();
        await db.add(storeName, item as T & CoffeeBag & CoffeeBrew);
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
      const updated = { ...original, ...updates, updatedAt: new Date() } as T;

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
     * Remove an item from the store
     */
    async remove(id: string): Promise<void> {
      const original = items.find((item) => item.id === id);
      if (!original) return;

      // Update reactive state immediately
      items = items.filter((item) => item.id !== id);

      if (!browser) return;

      try {
        const db = await getDB();
        await db.delete(storeName, id);
      } catch (error) {
        console.error(`Failed to remove item from ${storeName}:`, error);
        // Rollback on error - insert back at original position
        items = [...items, original].sort(
          (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
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
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
      );

      if (!browser) return;

      try {
        const db = await getDB();
        const tx = db.transaction(storeName, "readwrite");
        await tx.store.clear();
        await Promise.all(
          newItems.map((item) =>
            tx.store.add(item as T & CoffeeBag & CoffeeBrew),
          ),
        );
        await tx.done;
      } catch (error) {
        console.error(`Failed to set all items in ${storeName}:`, error);
        // Rollback on error
        items = original;
        throw error;
      }
    },
  };
}

// Create the stores
export const coffeeBagStore = createIDBStore<CoffeeBag>("coffeeBags");
export const coffeeBrewStore = createIDBStore<CoffeeBrew>("coffeeBrews");

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
  bagId: string,
): Promise<CoffeeBrew[]> {
  if (!browser) return [];

  try {
    const db = await getDB();
    return db.getAllFromIndex("coffeeBrews", "by-bag", bagId);
  } catch (error) {
    console.error("Failed to get brews for bag from IndexedDB:", error);
    return [];
  }
}

/**
 * Helper to clear all stored data
 */
export async function clearAllData(): Promise<void> {
  await Promise.all([coffeeBagStore.clear(), coffeeBrewStore.clear()]);
}
