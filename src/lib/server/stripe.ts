import Stripe from 'stripe';
import { env } from '$env/dynamic/private';
import { db } from '$lib/server/db/connection';
import { subscriptions } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

let _stripe: Stripe;
function getStripe() {
    if (!_stripe) {
        _stripe = new Stripe(env.STRIPE_SECRET_KEY!);
    }
    return _stripe;
}

export { getStripe as stripe };

export async function getOrCreateCustomer(
    userId: string,
    email: string
): Promise<string> {
    const existing = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.userId, userId))
        .limit(1);

    if (existing.length > 0) {
        return existing[0].stripeCustomerId;
    }

    const customer = await getStripe().customers.create({
        email,
        metadata: { userId },
    });

    await db.insert(subscriptions).values({
        id: crypto.randomUUID(),
        userId,
        stripeCustomerId: customer.id,
        status: 'inactive',
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    return customer.id;
}

export type Plan = 'monthly' | 'yearly';

const priceEnvKey: Record<Plan, string> = {
    monthly: 'MONTHLY_SUBSCRIPTION_STRIPE_PRICE_ID',
    yearly: 'YEARLY_SUBSCRIPTION_STRIPE_PRICE_ID',
};

export async function createCheckoutSession(
    userId: string,
    email: string,
    origin: string,
    plan: Plan = 'monthly'
): Promise<Stripe.Checkout.Session> {
    const customerId = await getOrCreateCustomer(userId, email);
    const priceId = env[priceEnvKey[plan]];
    if (!priceId) {
        throw new Error(`Missing env var ${priceEnvKey[plan]}`);
    }

    return getStripe().checkout.sessions.create({
        customer: customerId,
        mode: 'subscription',
        ui_mode: 'embedded',
        line_items: [{ price: priceId, quantity: 1 }],
        return_url: `${origin}/account?checkout=success`,
    });
}

export async function createPortalSession(
    customerId: string,
    origin: string
): Promise<Stripe.BillingPortal.Session> {
    return getStripe().billingPortal.sessions.create({
        customer: customerId,
        return_url: `${origin}/account`,
    });
}

export async function getSubscription(userId: string) {
    const rows = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.userId, userId))
        .limit(1);

    return rows[0] ?? null;
}

export async function syncSubscriptionFromStripe(
    stripeSubscription: Stripe.Subscription
) {
    const customerId =
        typeof stripeSubscription.customer === 'string'
            ? stripeSubscription.customer
            : stripeSubscription.customer.id;

    const status = stripeSubscription.status === 'active'
        ? 'active'
        : stripeSubscription.status === 'past_due'
          ? 'past_due'
          : stripeSubscription.status === 'canceled'
            ? 'canceled'
            : 'inactive';

    const periodEndSeconds = stripeSubscription.items.data[0]?.current_period_end;
    const currentPeriodEnd = periodEndSeconds
        ? new Date(periodEndSeconds * 1000)
        : null;

    await db
        .update(subscriptions)
        .set({
            stripeSubscriptionId: stripeSubscription.id,
            status,
            currentPeriodEnd,
            cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
            updatedAt: new Date(),
        })
        .where(eq(subscriptions.stripeCustomerId, customerId));
}

export async function markSubscriptionCanceled(
    stripeSubscriptionId: string
) {
    await db
        .update(subscriptions)
        .set({
            status: 'canceled',
            cancelAtPeriodEnd: false,
            updatedAt: new Date(),
        })
        .where(eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId));
}
