# Storage Migration: LocalStorage → IndexedDB

## Overview

This document outlines the steps to migrate our storage layer from `localStorage` to IndexedDB using the [`idb`](https://github.com/jakearchibald/idb) package, which provides a clean Promise-based wrapper around the IndexedDB API.

## Why IndexedDB?

| Feature | LocalStorage | IndexedDB |
|---------|--------------|-----------|
| Storage Limit | ~5-10 MB | 50% of disk space (typically GB) |
| Data Types | Strings only | Structured data, Blobs, Files |
| Performance | Synchronous (blocks UI) | Asynchronous |
| Durability | Can be cleared by browser | More persistent, better for PWAs |
| Querying | No indexing | Supports indexes and cursors |

## Current Implementation

Located in `src/lib/storage/local-storage.svelte.ts`:

- Uses `localStorage` with JSON serialization
- Custom `dateReviver` for Date object deserialization
- Reactive Svelte 5 stores via `$state`
- Exports: `coffeeBagStore`, `coffeeBrewStore`, helper functions

### Current Store Interface

```typescript
{
  items: T[];           // Reactive getter
  add(item: T): void;
  update(id: string, updates: Partial<T>): void;
  remove(id: string): void;
  getById(id: string): T | undefined;
  clear(): void;
  setAll(newItems: T[]): void;
}
```

## Migration Steps

### Step 1: Create Database Schema

Create a new file `src/lib/storage/idb-storage.svelte.ts`:

```typescript
import { openDB, type DBSchema, type IDBPDatabase } from 'idb';

interface DialInDB extends DBSchema {
  coffeeBags: {
    key: string;
    value: CoffeeBag;
    indexes: { 'by-created': Date };
  };
  coffeeBrews: {
    key: string;
    value: CoffeeBrew;
    indexes: {
      'by-created': Date;
      'by-bag': string;
    };
  };
}

const DB_NAME = 'dial-in-db';
const DB_VERSION = 1;
```

### Step 2: Initialize Database

```typescript
async function initDB(): Promise<IDBPDatabase<DialInDB>> {
  return openDB<DialInDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Coffee Bags store
      const bagStore = db.createObjectStore('coffeeBags', { keyPath: 'id' });
      bagStore.createIndex('by-created', 'createdAt');

      // Coffee Brews store
      const brewStore = db.createObjectStore('coffeeBrews', { keyPath: 'id' });
      brewStore.createIndex('by-created', 'createdAt');
      brewStore.createIndex('by-bag', 'coffeeBagId');
    },
  });
}
```

### Step 3: Create Async Store Operations

Replace synchronous localStorage calls with async IndexedDB operations:

```typescript
async function createIDBStore<T extends { id: string; createdAt: Date }>(
  storeName: 'coffeeBags' | 'coffeeBrews'
) {
  const db = await initDB();
  let items = $state<T[]>([]);

  // Load initial data
  async function load() {
    const all = await db.getAll(storeName);
    items = all.sort((a, b) =>
      b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  return {
    get items() { return items; },

    async add(item: T) {
      await db.add(storeName, item);
      items = [item, ...items];
    },

    async update(id: string, updates: Partial<T>) {
      const existing = await db.get(storeName, id);
      if (existing) {
        const updated = { ...existing, ...updates, updatedAt: new Date() };
        await db.put(storeName, updated);
        items = items.map(i => i.id === id ? updated : i);
      }
    },

    async remove(id: string) {
      await db.delete(storeName, id);
      items = items.filter(i => i.id !== id);
    },

    // ... other methods
    load,
  };
}
```

### Step 4: Handle Async Initialization

Since IndexedDB is async, we need to handle store initialization:

```typescript
// Option A: Export a promise
export const coffeeBagStorePromise = createIDBStore<CoffeeBag>('coffeeBags');

// Option B: Use a loader pattern
let _coffeeBagStore: Awaited<ReturnType<typeof createIDBStore<CoffeeBag>>> | null = null;

export async function getCoffeeBagStore() {
  if (!_coffeeBagStore) {
    _coffeeBagStore = await createIDBStore<CoffeeBag>('coffeeBags');
    await _coffeeBagStore.load();
  }
  return _coffeeBagStore;
}
```

### Step 5: Update Component Usage

Components will need to await store initialization. Use SvelteKit's `+page.ts` load functions or `{#await}` blocks:

```svelte
<!-- Option A: In +page.ts -->
export async function load() {
  const store = await getCoffeeBagStore();
  return { coffeeBags: store.items };
}

<!-- Option B: In component -->
{#await getCoffeeBagStore() then store}
  {#each store.items as bag}
    <!-- render bag -->
  {/each}
{/await}
```

### Step 6: Update Helper Functions

```typescript
export async function getBrewsForBag(bagId: string): Promise<CoffeeBrew[]> {
  const db = await initDB();
  return db.getAllFromIndex('coffeeBrews', 'by-bag', bagId);
}
```

### Step 7: Handle Blob Storage for Images

IndexedDB natively supports Blobs, simplifying image storage:

```typescript
// No more base64 encoding needed!
async function addBagWithImage(bag: CoffeeBag, imageBlob: Blob) {
  const db = await initDB();
  await db.add('coffeeBags', { ...bag, picture: imageBlob });
}
```

## File Changes Summary

| File | Action |
|------|--------|
| `src/lib/storage/idb-storage.svelte.ts` | **Create** - New IndexedDB implementation |
| `src/lib/storage/local-storage.svelte.ts` | **Delete** or keep for reference |
| `src/lib/storage/index.ts` | **Update** - Export new IDB stores |
| `src/routes/+layout.svelte` | **Update** - Initialize stores on app load |
| Components using stores | **Update** - Handle async store access |

## Considerations

1. **Browser Support**: IndexedDB is supported in all modern browsers. The `idb` package handles edge cases.

2. **Error Handling**: Add try/catch blocks around all IDB operations.

3. **SSR Compatibility**: Wrap IDB calls with `browser` check from `$app/environment`.

4. **Testing**: Consider using `fake-indexeddb` for unit tests.

5. **Reactivity**: The `$state` reactivity will still work since we update the reactive array after each IDB operation.
