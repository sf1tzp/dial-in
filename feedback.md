Responded to maintainer request for feedback on the remote data sync PR.
Feedback Provided

Identified architectural strengths:

    Well-structured local-first sync with proper conflict resolution
    Good separation: schema, store, API endpoints, client service
    Soft deletes and appropriate indexing

Critical gaps flagged:

    IndexedDB schema missing sync metadata - Local stores lack deviceId, syncedAt, deletedAt fields required by sync protocol
    Performance issue - Push sends all local data every sync instead of tracking deltas since last sync
    No sync visibility - Users cannot see sync status, last sync time, or errors
    Missing FK constraints - coffee_brews.coffee_bag_id lacks foreign key to coffee_bags.id
    Setup friction - No .env.example documenting DATABASE_URL variable

The sync service currently operates but inefficiently:

// src/lib/storage/sync.svelte.ts:307-308
// Pushes ALL data every sync - no delta tracking
const coffeeBags = coffeeBagStore.items.map(localBagToRemote);
const coffeeBrews = coffeeBrewStore.items.map(localBrewToRemote);

Primary blocker is IndexedDB schema updates to support sync metadata fields.