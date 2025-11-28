import { browser } from "$app/environment";
import type { CoffeeBag, CoffeeBrew } from "./interfaces";

const STORAGE_KEYS = {
  coffeeBags: "dial-in:coffee-bags",
  coffeeBrews: "dial-in:coffee-brews",
} as const;

/**
 * Reviver function for JSON.parse to convert date strings back to Date objects
 */
function dateReviver(_key: string, value: unknown): unknown {
  if (typeof value === "string") {
    // ISO 8601 date format regex
    const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;
    if (dateRegex.test(value)) {
      return new Date(value);
    }
  }
  return value;
}

/**
 * Load data from localStorage with proper date deserialization
 */
function loadFromStorage<T>(key: string, defaultValue: T[]): T[] {
  if (!browser) return defaultValue;

  try {
    const stored = localStorage.getItem(key);
    if (!stored) return defaultValue;
    return JSON.parse(stored, dateReviver) as T[];
  } catch (error) {
    console.error(`Failed to load ${key} from localStorage:`, error);
    return defaultValue;
  }
}

/**
 * Save data to localStorage
 */
function saveToStorage<T>(key: string, data: T[]): void {
  if (!browser) return;

  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Failed to save ${key} to localStorage:`, error);
  }
}

/**
 * Creates a reactive store backed by localStorage
 */
function createPersistedStore<T extends { id: string; createdAt: Date }>(
  storageKey: string,
  initialData: T[] = [],
) {
  let items = $state<T[]>(loadFromStorage(storageKey, initialData));

  return {
    get items() {
      return items;
    },

    add(item: T) {
      items = [item, ...items];
      saveToStorage(storageKey, items);
    },

    update(id: string, updates: Partial<T>) {
      items = items.map((item) =>
        item.id === id ? { ...item, ...updates, updatedAt: new Date() } : item,
      );
      saveToStorage(storageKey, items);
    },

    remove(id: string) {
      items = items.filter((item) => item.id !== id);
      saveToStorage(storageKey, items);
    },

    getById(id: string): T | undefined {
      return items.find((item) => item.id === id);
    },

    clear() {
      items = [];
      saveToStorage(storageKey, items);
    },

    /**
     * Replace all items (useful for importing data)
     */
    setAll(newItems: T[]) {
      items = newItems;
      saveToStorage(storageKey, items);
    },
  };
}

// Create the stores
export const coffeeBagStore = createPersistedStore<CoffeeBag>(
  STORAGE_KEYS.coffeeBags,
);
export const coffeeBrewStore = createPersistedStore<CoffeeBrew>(
  STORAGE_KEYS.coffeeBrews,
);

// Helper to get brews for a specific bag
export function getBrewsForBag(bagId: string): CoffeeBrew[] {
  return coffeeBrewStore.items.filter((brew) => brew.coffeeBagId === bagId);
}

// Helper to clear all stored data
export function clearAllData(): void {
  coffeeBagStore.clear();
  coffeeBrewStore.clear();
}
