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


----

> We've implemented a local first data strategy for our app, where data is initially read/written to indexed DB on the device, and sync'd to an upstream db. Since its possilbe to use the app without signing up, an edge case has appeared
>
>  - user creates data before sign up
>  - user signs up, data is synced
>  - user logs out
>  - data still shown because it's local and not access controlled
> What is a reasonable expectation for users to have in this scenario? after creating an account should we require log-in to view the local data?

This is a common challenge with local-first apps that support anonymous-to-authenticated transitions.

## Reasonable User Expectations

**Most users would expect:** Once they've created an account and logged out, they should need to log back in to see their data. The act of creating an account signals "I want this data protected."

## Recommended Approach

**Clear the local data on logout** (or encrypt it with user credentials). Here's why:

1. **Security expectation** - Creating an account implies the user wants access control
2. **Shared device risk** - Another person using the same browser/device shouldn't see previous user's data
3. **Mental model alignment** - Users understand "logged out = can't access my stuff"

## Implementation Options

| Approach | Pros | Cons |
|----------|------|------|
| **Clear local DB on logout** | Simple, secure | Data unavailable offline until re-login |
| **Encrypt local DB with user key** | Data stays local, secure | More complex, key management needed |
| **Partition by user ID** | Multiple accounts work | Anonymous data orphaned, storage bloat |

## Edge Case Handling

For the pre-signup data specifically:

1. **On account creation**: Associate local data with the new user ID
2. **On logout**: Clear or encrypt that user's partition
3. **On login**: Re-fetch from server (or decrypt local)

## Simple Rule of Thumb

> If the user has **never** signed up → show local data freely
> If the user **has** an account (even if logged out) → require authentication

This matches how most cloud-synced apps (Notes, Notion, etc.) behave and won't surprise users.

Good question! Let me analyze your current implementation to understand the data structures and sync setup, then we can evaluate the encryption vs. re-download tradeoffs. Now let me check the typical data sizes and see how much data might need to be encrypted or re-downloaded: Now I have a good understanding of your setup. Let me give you a practical analysis:

---

## Encryption vs. Re-download: Practical Comparison

### Your Data Profile
Based on your schema, you're storing:
- **CoffeeBags**: Small text records (~1-2KB each) + optional pictures (Blobs/URLs)
- **CoffeeBrews**: Small text records (~500B each) + optional pictures

### Option 1: Encrypt Local Data on Logout

**How it would work with Web Crypto API:**
```typescript
// Derive key from user password/token
const key = await crypto.subtle.deriveKey(
  { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
  await crypto.subtle.importKey('raw', passwordBytes, 'PBKDF2', false, ['deriveKey']),
  { name: 'AES-GCM', length: 256 },
  false,
  ['encrypt', 'decrypt']
);
```

**Challenges specific to your setup:**
1. **Pictures (Blobs)** - Encrypting large blobs is slow and increases storage ~33% (base64 overhead)
2. **Key management** - You'd need to derive a key from the user's session, then store it server-side or re-derive on login
3. **IndexedDB rewrite** - You'd need to read all data, encrypt, and write back on logout (~2x I/O)
4. **Reactive stores** - Your `$state` arrays would need decryption middleware

**Estimated complexity:** 200-400 lines of code, plus key storage endpoint

---

### Option 2: Clear Local + Re-download

**How it would work:**
```typescript
// On logout
async function onLogout() {
  const db = await openDB('dial-in-db');
  await db.clear('coffeeBags');
  await db.clear('coffeeBrews');
  localStorage.removeItem('dial-in-last-sync');
}

// On login - your existing sync already handles this!
await syncService.pull(); // Fetches everything since lastSyncTime=null
```

**Advantages for your app:**
1. **You already have the sync infrastructure** - `pull()` handles full re-sync
2. **Pictures stay on server** - Only URLs are synced, not blobs
3. **~10 lines of code** to clear on logout
4. **Delta sync works** - After initial login, only changes sync

---

### Practical Recommendation

**Go with clear + re-download** because:

| Factor | Encrypt | Re-download |
|--------|---------|-------------|
| Implementation time | Days | Hours |
| Code complexity | High | Minimal |
| Your existing sync | Unused | Leveraged |
| Picture handling | Problematic | Already solved (URLs) |
| Offline-after-logout | ⚠️ Limited value | N/A |

The offline-after-logout benefit of encryption is minimal for your use case—if a user logs out, they likely don't expect to use the app offline with their data.

### Simple Implementation

Add this to your auth logout flow:

```typescript
// In your logout handler
export async function clearLocalDataOnLogout() {
  if (!browser) return;

  const db = await openDB<DialInDB>('dial-in-db', DB_VERSION);
  await db.clear('coffeeBags');
  await db.clear('coffeeBrews');

  localStorage.removeItem('dial-in-last-sync');
  localStorage.removeItem('dial-in-device-id'); // Optional: new device ID on re-login

  // Reset reactive stores
  coffeeBagStore.reset(); // You'd add a reset() method
  coffeeBrewStore.reset();
}
```

Would you like me to implement this clear-on-logout approach in your codebase?