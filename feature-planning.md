# Feature Planning

### Feature: When scrolling down the timeline, we should hover some filter options at the top of the page, eg Bag Selector

The demo data presents a scenario with multiple interleaved bags & brews, which feels cluttered if you're trying to look at a specific set

### Feature: Use a virtual list to display the timeline

The timeline potentially contains hundreds of items, depending on activity. We can leverage a virtual list to reduce bottlenecks

### Feature: Allow user to supply Grind and Pressure Units and Scale

My grinder and esspresso machine do not have real units of measure. We scaffolded some settings
in `$lib/settings.ts`, but do not provide users a way to override the defaults. Supporting this
feature will allow the app to record more precice measurements for users with better equipment.

### Enhancement: Custom Grind Setting and Pressure Reading Input Components

I would really like to mimic the physical grinder dial and pressure gauge appearance in the app.

### Bug: The Brew Form should pre-select the previous grinder setting

It's annoying that this input defaults to "0". Once a user is 'dialed-in' it's less likely that they
will change the grinder setting.

### Feature: Disambiguate duplicate coffee bags in selectors and timeline

**Problem:** Users frequently re-order the same coffee. When two bags share the same name and
roaster, they are indistinguishable in the brew form's bag selector dropdown (renders as
`{name} - {roasterName}` for both) and in timeline entries.

**Scope:**
- Detect when multiple active bags share `name + roasterName`.
- In those cases, append the `dateOpened` (or a bag sequence number like "#2") as a disambiguator
  in every UI surface that renders a bag label:
  - Brew form `<select>` options (`CoffeeBrewForm.svelte:58-60`)
  - Timeline `BagEntry` and `BrewEntry` displays
  - Stats page bag groupings
- Consider extracting a shared `formatBagLabel(bag, allBags)` utility so the logic lives in one
  place.

**Key files:**
- `src/lib/components/forms/CoffeeBrewForm.svelte` — bag selector dropdown
- `src/lib/components/timeline/BagEntry.svelte` — bag timeline card
- `src/lib/components/timeline/BrewEntry.svelte` — brew timeline card (shows parent bag name)
- `src/routes/stats/+page.svelte` — stats groupings

**Notes:**
- The README already calls this out (see "When the same Kind of Bag is added more than once…")
  but no implementation exists yet.
- `dateOpened` can be undefined; fall back to `createdAt` for display if needed.

---

### Feature: Bag archiving — auto-archive brews when a new bag of the same coffee is opened

**Problem:** The timeline grows indefinitely. Once a user finishes a bag and opens a replacement,
the old bag's brews still clutter the main timeline. There is no concept of a bag lifecycle beyond
"exists" and "soft-deleted."

**Scope:**

1. **Add an `archivedAt` field to `CoffeeBag`:**
   - `interfaces.ts`: add `archivedAt: Date | null` to `CoffeeBag`
   - `schema.ts`: add `archivedAt` timestamp column to `coffee_bags` table
   - `idb-storage.svelte.ts`: handle the new field in IndexedDB migrations
   - `sync.svelte.ts` + server push/pull endpoints: include `archivedAt` in sync payloads
   - Generate a Drizzle migration for the new column.

2. **Archive trigger — on bag open:**
   - When a user opens a new bag, check if any existing *active* (non-archived) bags share the
     same `name + roasterName`.
   - If so, prompt the user: *"You already have '{name}' open. Archive the previous bag and its
     brews?"*
   - If confirmed, set `archivedAt = now` on the old bag. Its associated brews are implicitly
     archived (they belong to an archived bag).
   - The user can also manually archive a bag via its edit/context menu without opening a
     duplicate.

3. **Timeline filtering:**
   - The main timeline should default to showing only *active* (non-archived) bags and their
     brews.
   - Add a toggle/filter (e.g. "Show archived") to reveal archived entries, visually
     distinguished (muted styling, "Archived" badge, etc.).
   - The existing filter-by-bag feature idea (sticky header filters) pairs well here — archived
     bags would appear in a separate section of the filter list.

4. **Unarchive:**
   - Allow users to unarchive a bag (set `archivedAt = null`) from the archived view or bag
     detail dialog.

**Key files:**
- `src/lib/storage/interfaces.ts`
- `src/lib/server/db/schema.ts`
- `src/lib/storage/idb-storage.svelte.ts`
- `src/lib/storage/sync.svelte.ts` + `src/lib/server/db/store.ts`
- `src/routes/+page.svelte` — timeline filtering logic
- `src/lib/components/timeline/CoffeeTimeline.svelte`
- `src/lib/components/forms/CoffeeBagForm.svelte` — archive prompt on submit

**Notes:**
- Archiving is intentionally non-destructive — no data is lost, unlike the current delete cascade.
- Stats should still include archived brews so historical data isn't hidden.

---

### Feature: S3 image upload for coffee bag and brew photos

**Problem:** The `picture` field exists on both `CoffeeBag` and `CoffeeBrew` and accepts file
input in forms, but images are only stored as local Blobs in IndexedDB. During sync push, blobs
are skipped (`typeof local.picture === 'string' ? local.picture : undefined`), so photos are
never persisted server-side and are lost if local storage is evicted.

**Scope:**

1. **Server-side: S3 upload endpoint**
   - Add `POST /api/images/upload` that accepts `multipart/form-data`.
   - Validate file type (image/*) and enforce a reasonable size limit (e.g. 5 MB).
   - Upload to S3 (using the AWS SDK). Use a key structure like
     `users/{userId}/{entityType}/{entityId}/{uuid}.{ext}`.
   - Return the resulting S3 URL (or a CDN-fronted URL if applicable).
   - Auth-gate the endpoint — only the owning user can upload.

2. **Client-side: upload during sync push**
   - Before pushing a dirty bag/brew whose `picture` is a Blob, upload the Blob to
     `/api/images/upload`.
   - On success, replace the local Blob reference with the returned URL string and mark the
     entity dirty so the URL is included in the next push payload.
   - Handle upload failures gracefully — the entity can still sync without the image and retry
     the upload on the next sync cycle.

3. **Client-side: display remote images**
   - The display logic already handles both Blob and string URLs (`URL.createObjectURL` vs.
     direct `src`), so remote images should render with no additional work.
   - Consider lazy-loading / thumbnail generation for performance once image volume grows.

4. **Environment configuration:**
   - S3 bucket name, region, and credentials via environment variables
     (`S3_BUCKET`, `S3_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`).
   - Document the required env vars.

**Key files:**
- New: `src/routes/api/images/upload/+server.ts` — upload endpoint
- New: `src/lib/server/s3.ts` — S3 client singleton and upload helper
- `src/lib/storage/sync.svelte.ts` — pre-push image upload step
- `src/lib/storage/interfaces.ts` — no schema change needed (`picture` already supports string)
- `src/lib/server/db/schema.ts` — no change needed (`picture` column is already `text`)

**Notes:**
- Image deletion (when a bag/brew is deleted) is a follow-up concern — could use S3 lifecycle
  policies or a cleanup job.
- Compression/resizing client-side before upload (e.g. via canvas or a library like
  `browser-image-compression`) would reduce bandwidth and storage costs — worth considering but
  not required for v1.