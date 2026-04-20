import type { Handle } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';

export const handle: Handle = async ({ event, resolve }) => {
    event.locals.session = null;
    event.locals.user = null;

    try {
        const session = await auth.api.getSession({
            headers: event.request.headers,
        });

        if (session) {
            event.locals.session = session.session;
            event.locals.user = session.user;
        }
    } catch (error) {
        console.error('Failed to get session:', error);
    }

    return resolve(event);
};
