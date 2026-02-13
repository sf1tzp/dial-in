import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import {
    stripe,
    syncSubscriptionFromStripe,
    markSubscriptionCanceled,
} from '$lib/server/stripe';
import type Stripe from 'stripe';

export const POST: RequestHandler = async ({ request }) => {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
        throw error(400, 'Missing stripe-signature header');
    }

    let event: Stripe.Event;
    try {
        event = stripe().webhooks.constructEvent(
            body,
            signature,
            env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err) {
        console.error('Stripe webhook signature verification failed:', err);
        throw error(400, 'Invalid signature');
    }

    switch (event.type) {
        case 'checkout.session.completed': {
            const session = event.data.object as Stripe.Checkout.Session;
            if (session.subscription) {
                const subscriptionId =
                    typeof session.subscription === 'string'
                        ? session.subscription
                        : session.subscription.id;
                const subscription =
                    await stripe().subscriptions.retrieve(subscriptionId);
                await syncSubscriptionFromStripe(subscription);
            }
            break;
        }
        case 'invoice.paid': {
            const invoice = event.data.object as Stripe.Invoice;
            const sub = invoice.parent?.subscription_details?.subscription;
            if (sub) {
                const subscriptionId =
                    typeof sub === 'string' ? sub : sub.id;
                const subscription =
                    await stripe().subscriptions.retrieve(subscriptionId);
                await syncSubscriptionFromStripe(subscription);
            }
            break;
        }
        case 'customer.subscription.updated': {
            const subscription = event.data
                .object as Stripe.Subscription;
            await syncSubscriptionFromStripe(subscription);
            break;
        }
        case 'customer.subscription.deleted': {
            const subscription = event.data
                .object as Stripe.Subscription;
            await markSubscriptionCanceled(subscription.id);
            break;
        }
    }

    return json({ received: true });
};
