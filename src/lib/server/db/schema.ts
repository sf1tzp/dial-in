/**
 * PostgreSQL schema for remote data storage
 * Mirrors the IndexedDB schema with additional sync metadata
 */

import {
    pgTable,
    text,
    timestamp,
    real,
    index,
    boolean,
    uniqueIndex,
} from 'drizzle-orm/pg-core';

/**
 * Coffee Bags table
 * Stores coffee bag information with sync metadata
 */
export const coffeeBags = pgTable(
    'coffee_bags',
    {
        // Primary fields (matching IndexedDB)
        id: text('id').primaryKey(), // UUID generated client-side
        name: text('name').notNull(),
        roasterName: text('roaster_name').notNull(),
        style: text('style').notNull(),
        notes: text('notes').notNull().default(''),
        dateRoasted: timestamp('date_roasted', { mode: 'date' }),
        dateOpened: timestamp('date_opened', { mode: 'date' }),
        picture: text('picture'), // URL for remote storage

        // Sync metadata
        userId: text('user_id').notNull(), // Owner of this record
        deviceId: text('device_id').notNull(), // Device that last modified
        createdAt: timestamp('created_at', { mode: 'date' }).notNull(),
        updatedAt: timestamp('updated_at', { mode: 'date' }).notNull(),
        archivedAt: timestamp('archived_at', { mode: 'date' }),
        deletedAt: timestamp('deleted_at', { mode: 'date' }), // Soft delete for sync
        syncedAt: timestamp('synced_at', { mode: 'date' }), // Last successful sync
    },
    (table) => [
        index('coffee_bags_user_id_idx').on(table.userId),
        index('coffee_bags_updated_at_idx').on(table.updatedAt),
        index('coffee_bags_user_updated_idx').on(table.userId, table.updatedAt),
    ]
);

/**
 * Coffee Brews table
 * Stores brew records with sync metadata
 */
export const coffeeBrews = pgTable(
    'coffee_brews',
    {
        // Primary fields (matching IndexedDB)
        id: text('id').primaryKey(), // UUID generated client-side
        coffeeBagId: text('coffee_bag_id')
            .notNull()
            .references(() => coffeeBags.id, { onDelete: 'cascade' }),
        grindSetting: real('grind_setting').notNull(),
        dryWeight: real('dry_weight').notNull(),
        brewTime: real('brew_time').notNull(),
        pressureReading: real('pressure_reading').notNull(),
        notes: text('notes'),
        picture: text('picture'), // URL for remote storage

        // Sync metadata
        userId: text('user_id').notNull(), // Owner of this record
        deviceId: text('device_id').notNull(), // Device that last modified
        createdAt: timestamp('created_at', { mode: 'date' }).notNull(),
        updatedAt: timestamp('updated_at', { mode: 'date' }).notNull(),
        deletedAt: timestamp('deleted_at', { mode: 'date' }), // Soft delete for sync
        syncedAt: timestamp('synced_at', { mode: 'date' }), // Last successful sync
    },
    (table) => [
        index('coffee_brews_user_id_idx').on(table.userId),
        index('coffee_brews_bag_id_idx').on(table.coffeeBagId),
        index('coffee_brews_updated_at_idx').on(table.updatedAt),
        index('coffee_brews_user_updated_idx').on(
            table.userId,
            table.updatedAt
        ),
    ]
);

/**
 * Sync Queue table (optional - for server-side conflict tracking)
 * Can be used to log sync operations for debugging/auditing
 */
export const syncLog = pgTable(
    'sync_log',
    {
        id: text('id').primaryKey(),
        userId: text('user_id').notNull(),
        deviceId: text('device_id').notNull(),
        operation: text('operation').notNull(), // 'push' | 'pull'
        entityType: text('entity_type').notNull(), // 'coffeeBag' | 'coffeeBrew'
        entityId: text('entity_id').notNull(),
        timestamp: timestamp('timestamp', { mode: 'date' }).notNull(),
        status: text('status').notNull(), // 'success' | 'conflict' | 'error'
        details: text('details'), // JSON string for additional info
    },
    (table) => [
        index('sync_log_user_id_idx').on(table.userId),
        index('sync_log_timestamp_idx').on(table.timestamp),
    ]
);

/**
 * Subscriptions table
 * Tracks Stripe subscription state per user
 */
export const subscriptions = pgTable(
    'subscriptions',
    {
        id: text('id').primaryKey(), // UUID
        userId: text('user_id').notNull(),
        stripeCustomerId: text('stripe_customer_id').notNull(),
        stripeSubscriptionId: text('stripe_subscription_id'),
        status: text('status').notNull().default('inactive'), // 'active' | 'past_due' | 'canceled' | 'inactive'
        currentPeriodEnd: timestamp('current_period_end', { mode: 'date' }),
        cancelAtPeriodEnd: boolean('cancel_at_period_end')
            .notNull()
            .default(false),
        createdAt: timestamp('created_at', { mode: 'date' }).notNull(),
        updatedAt: timestamp('updated_at', { mode: 'date' }).notNull(),
    },
    (table) => [
        uniqueIndex('subscriptions_user_id_idx').on(table.userId),
        index('subscriptions_stripe_customer_id_idx').on(
            table.stripeCustomerId
        ),
        index('subscriptions_stripe_subscription_id_idx').on(
            table.stripeSubscriptionId
        ),
    ]
);

// Type exports for use in application code
export type CoffeeBagRecord = typeof coffeeBags.$inferSelect;
export type CoffeeBagInsert = typeof coffeeBags.$inferInsert;
export type CoffeeBrewRecord = typeof coffeeBrews.$inferSelect;
export type CoffeeBrewInsert = typeof coffeeBrews.$inferInsert;
export type SyncLogRecord = typeof syncLog.$inferSelect;
export type SyncLogInsert = typeof syncLog.$inferInsert;
export type SubscriptionRecord = typeof subscriptions.$inferSelect;
export type SubscriptionInsert = typeof subscriptions.$inferInsert;
