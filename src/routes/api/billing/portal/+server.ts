import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getSubscription, createPortalSession } from '$lib/server/stripe';

export const POST: RequestHandler = async ({ locals, url }) => {
    if (!locals.user) {
        throw error(401, 'Unauthorized');
    }

    const subscription = await getSubscription(locals.user.id);
    if (!subscription) {
        throw error(404, 'No subscription found');
    }

    const session = await createPortalSession(
        subscription.stripeCustomerId,
        url.origin
    );

    return json({ url: session.url });
};
