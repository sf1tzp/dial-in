import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getSubscription } from '$lib/server/stripe';

export const GET: RequestHandler = async ({ locals }) => {
    if (!locals.user) {
        throw error(401, 'Unauthorized');
    }

    const subscription = await getSubscription(locals.user.id);

    return json({
        status: subscription?.status ?? 'inactive',
        currentPeriodEnd: subscription?.currentPeriodEnd?.toISOString() ?? null,
        cancelAtPeriodEnd: subscription?.cancelAtPeriodEnd ?? false,
    });
};
