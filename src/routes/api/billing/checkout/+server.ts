import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createCheckoutSession, type Plan } from '$lib/server/stripe';

const validPlans: Plan[] = ['monthly', 'yearly'];

export const POST: RequestHandler = async ({ locals, url, request }) => {
    if (!locals.user) {
        throw error(401, 'Unauthorized');
    }

    const body = await request.json().catch(() => ({}));
    const plan: Plan = validPlans.includes(body.plan) ? body.plan : 'monthly';

    const session = await createCheckoutSession(
        locals.user.id,
        locals.user.email,
        url.origin,
        plan
    );

    return json({ clientSecret: session.client_secret });
};
