# Dial In

Track brewing parameters and dial in the perfect brew.

## Screenshots

### Homepage

![Homepage screenshot](https://i.imgur.com/t9U9kKw.png)

### Statistics View

![Statistics view screenshot](https://i.imgur.com/Abw2oWp.png)

### Timeline View

![Timeline view screenshot](https://i.imgur.com/25YVc5h.png)

## Design Document

We will allow the user to track two main types of events and various metadata

- Opening a new bag of coffee:
  - Date roasted on
  - Date opened on
  - Name
  - Roaster name
  - Style
  - Notes
  - picture

- Brewing an Espresso:
  - Grinder coarseness
  - Grinder time setting
  - Dry weight
  - brew time
  - pressure gauge reading
  - pics
  - picture

We will provide a simple web UI, offering the user to record either a new bag or brew settings. Selecting either will open a mobile friendly form for the user to input the various metadata fields. Upon accepting the input, we will push a UI element to a scrollable 'timeline'.

In our UI, we will use intentional iconography to distinguish various concepts, including morning/day/night icons, and potentially weather iconography to add a sense of personality to our design.

### a11y and i18n

We will strive to follow modern A11y practices in our components.

It would be cool to support multiple translations of the app, because espresso is enjoyed all around the world.

## Storage

We are targeting a PWA-style experience for mobile web. Users should be able to use local offline storage compeltely free.

There are some durability concerns with browser local storage. [jakearchibald/idb/issues/299](https://github.com/jakearchibald/idb/issues/299)

We may later implement online features and offer these optional benefits:

- 1 Year data retention
- Sharable Profile
- Special CSS elements
- Graph and Statistics views

## Feature Planning & Enhancements:

### Feature: When scrolling down the timeline, we should hover some filter options at the top of the page, eg Bag Selector

The demo data presents a scenario with multiple interleaved bags & brews, which feels cluttered if you're trying to look at a specific set

### Feature: When the same Kind of Bag is added more than once, we need to use Opened-On date as a differentiator in Selector components

Users are fairly likely to order the same Kind of coffee again. Our app should account for this and track brews for each bag separately.

(Linking Bags of the same Kind of coffee is not in scope ATM)

### Feature: Use a virtual list to display the timeline

The timeline potentially contains hundreds of items, depending on activity. We can leverage a virtual list to reduce bottlenecks

### Feature: Allow user to supply Grind and Pressure Units and Scale

My grinder and esspresso machine do not have real units of measure. We scaffolded some settings
in `$lib/settings.ts`, but do not provide users a way to override the defaults. Supporting this
feature will allow the app to record more precice measurements for users with better equipment.

### Feature: Custom Grind Setting and Pressure Reading Input Components

I would really like to mimic the physical grinder dial and pressure gauge appearance in the app.

### Feature: Provide upstream data storage for persistence

idb cannot guarantee that data will not be evicted by the OS or Browser.
We should think about adding an export feature or implement serverside persistence.
[jakearchibald/idb/issues/299](https://github.com/jakearchibald/idb/issues/299)

We should warn users of the potential fragility of the default Browser storage,
and/or improve its robustness.

### Feature: The Brew Form should pre-select the previous grinder setting

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

---

## Roadmap: Multi-tenant product (freemium SaaS)

**Goal:** Transition Dial In from a personal tool at `dial-in.fitz.gg` into a standalone product
that anyone can use, with a free tier and a low-cost subscription.

### Why the architecture already fits

The local-first design is the free tier — users get the full app backed by IndexedDB with zero
server cost. The existing sync infrastructure (`sync.svelte.ts`, push/pull endpoints) already
scopes all data by `userId`, so multi-tenancy is largely in place. Auth is external (better-auth
with magic-link), so onboarding new users doesn't require passwords or OAuth plumbing beyond
what's already wired up.

What this means: most of the product work is gating, billing, and polish — not re-architecture.

### Tier structure

| | **Free (local-only)** | **Hosted ($1/mo)** |
|---|---|---|
| Core app (bags, brews, timeline, stats) | Yes | Yes |
| Local IndexedDB storage | Yes | Yes |
| Server sync & cross-device access | No | Yes |
| S3 image backup | No | Yes |
| Data export (JSON/CSV) | Yes | Yes |

### What needs to happen

1. **Feature-gate sync behind subscription status**
   - The sync service (`sync.svelte.ts`) currently starts whenever a user is authenticated. Add a
     check: only sync if the user's subscription is active.
   - The free tier still uses auth for identity (needed if they upgrade later), but sync calls
     are no-ops.
   - Gate the S3 upload endpoint similarly.

2. **Subscription billing (Stripe)**
   - Integrate Stripe Checkout for the $1/mo plan. A single plan keeps things simple.
   - Add a `subscriptionStatus` field to the user model (or read it from Stripe webhooks).
   - Webhook handler: `POST /api/webhooks/stripe` to process `checkout.session.completed`,
     `invoice.paid`, `customer.subscription.deleted`, etc.
   - Account settings page showing subscription status with manage/cancel link (Stripe Customer
     Portal).

3. **Onboarding & landing page**
   - Currently the app drops you straight into the timeline. New visitors need a landing page
     explaining what Dial In does, with a clear CTA to get started.
   - Magic-link sign-up is already low-friction — lean into that.
   - First-run experience: brief walkthrough or empty-state prompts (the empty-state in
     `CoffeeTimeline.svelte` is a start).

4. **Domain & branding**
   - Move from `dial-in.fitz.gg` to a dedicated domain (e.g. `dialin.coffee`, `getdialin.com`).
   - Keep `dial-in.fitz.gg` as a redirect or personal instance.
   - Update `PUBLIC_BETTER_AUTH_URL` and CORS origins for the new domain.

5. **Data durability messaging**
   - Free tier: surface a gentle warning that IndexedDB data can be evicted by the browser (the
     README already notes this concern via `jakearchibald/idb/issues/299`). Offer JSON export as
     a safety net.
   - Paid tier: emphasize that sync + S3 means their data is durable.

6. **Privacy, terms, and legal**
   - Privacy policy and terms of service — required before accepting payments.
   - GDPR-style data export/deletion (the soft-delete + sync infrastructure makes deletion
     straightforward).

### Sequencing

The features planned above feed directly into this:

1. **Bag disambiguation & archiving** — make the core experience solid
2. **S3 image upload** — prerequisite for the hosted tier's value prop
3. **Stripe integration & feature gating** — enable the paid tier
4. **Landing page & onboarding** — make it accessible to new users
5. **Launch on a dedicated domain**

### Notes
- At $1/mo the margins are thin. Keep infrastructure minimal — a single Postgres instance +
  S3 bucket can serve a large number of users at this data volume (small text records + occasional
  images).
- The `role` field on users (`auth-client.ts`) could distinguish `free` vs `subscriber` if you
  don't want to hit Stripe on every request, but caching subscription status locally is simpler.
- Consider a 14-day free trial of the hosted tier to reduce friction.
