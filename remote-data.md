# Remote syncing in our local-first strategy

Here's a solid approach for implementing local-first sync with your existing IndexedDB setup:

## Implementation Status

✅ **Completed:**
- PostgreSQL schema with sync metadata (`src/lib/server/db/schema.ts`)
- Server-side data store with CRUD + conflict resolution (`src/lib/server/db/store.ts`)
- Sync API endpoints (`src/routes/api/sync/pull/+server.ts`, `src/routes/api/sync/push/+server.ts`)
- Client-side sync service (`src/lib/storage/sync.svelte.ts`)
- Drizzle config for migrations (`drizzle.config.ts`)

## Architecture Overview

**Local Layer (IndexedDB via idb)**
- Primary data source for all app operations
- Fast, offline-capable
- Uses your existing idb implementation

**Sync Layer**
- Bidirectional sync between IndexedDB and PostgreSQL
- Conflict resolution strategy
- Queue for offline operations

**Remote Layer (PostgreSQL via Drizzle)**
- Authoritative source of truth when online
- Accessible across devices

## Implementation Strategy

**1. Add Metadata to Your Schema**

Add sync-related fields to both IndexedDB and PostgreSQL schemas:

```typescript
// Fields to add to your entities
{
  id: string,              // UUID, generated client-side
  updatedAt: number,       // timestamp in ms
  deletedAt: number | null, // soft deletes for sync
  syncedAt: number | null, // last successful sync
  deviceId: string         // identify which device made changes
}
```

**2. Sync Queue Pattern**

Create a sync queue in IndexedDB to track operations when offline:

```typescript
// syncQueue store
{
  id: string,
  operation: 'create' | 'update' | 'delete',
  entityType: string,
  entityId: string,
  data: any,
  timestamp: number,
  status: 'pending' | 'syncing' | 'failed'
}
```

**3. Sync Flow**

```
User Action → IndexedDB (immediate) → Sync Queue → Background Sync → PostgreSQL
                     ↓
              UI Updates (instant)
```

When online:
- User actions write to IndexedDB immediately
- Add operation to sync queue
- Background process drains queue to PostgreSQL
- On success, update `syncedAt` in IndexedDB

On app load (if authenticated):
- Pull changes from PostgreSQL where `updatedAt > local.syncedAt`
- Merge into IndexedDB using conflict resolution
- Push any pending queue items

**4. Conflict Resolution**

Use "Last Write Wins" with timestamps:

```typescript
function mergeEntity(local, remote) {
  if (!local) return remote;
  if (!remote) return local;

  // Remote is newer
  if (remote.updatedAt > local.updatedAt) {
    return remote;
  }

  // Local is newer and unsynced
  if (local.updatedAt > local.syncedAt) {
    return local; // will be pushed to server
  }

  return local;
}
```

**5. SvelteKit Implementation Structure**

```
src/
  lib/
    db/
      idb.ts              // Your existing idb setup
      sync.ts             // Sync orchestration
      syncQueue.ts        // Queue management
    server/
      db/
        schema.ts         // Drizzle schema
        client.ts         // Drizzle client
    api/
      sync/
        +server.ts        // Sync endpoints
```

**6. Key SvelteKit Endpoints**

```typescript
// src/routes/api/sync/pull/+server.ts
export async function GET({ locals }) {
  const lastSyncedAt = url.searchParams.get('since');
  // Return changes since lastSyncedAt
}

// src/routes/api/sync/push/+server.ts
export async function POST({ request, locals }) {
  // Receive batch of changes from client
  // Apply to PostgreSQL with conflict resolution
}
```

**7. Client-Side Sync Service**

```typescript
// lib/db/sync.ts
class SyncService {
  async syncNow() {
    if (!isAuthenticated) return;

    await this.pull(); // Get remote changes
    await this.push(); // Send local changes
  }

  startAutoSync() {
    // Sync every 30 seconds when active
    // Sync on visibility change, network reconnect
  }
}
```

## Advantages of This Approach

- **Instant UI updates** - writes go to IndexedDB first
- **Works offline** - sync queue handles it when back online
- **Cross-device** - PostgreSQL syncs between devices
- **Minimal refactoring** - your app logic stays IndexedDB-focused
- **Scalable** - can add operational transforms or CRDTs later if needed

## Considerations

- **Initial sync time** - pulling all data on first login may be slow for large datasets (consider pagination)
- **Schema migrations** - need to version both IndexedDB and PostgreSQL schemas
- **Soft deletes** - use `deletedAt` instead of hard deletes for proper sync
- **User ID scope** - ensure PostgreSQL queries filter by `userId` for multi-tenancy
