import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createCheckoutSession } from '$lib/server/stripe';

export const POST: RequestHandler = async ({ locals, url }) => {
    if (!locals.user) {
        throw error(401, 'Unauthorized');
    }

    const session = await createCheckoutSession(
        locals.user.id,
        locals.user.email,
        url.origin
    );

    return json({ url: session.url });
};
