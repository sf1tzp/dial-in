# Roadmap: Multi-tenant product (freemium SaaS)

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