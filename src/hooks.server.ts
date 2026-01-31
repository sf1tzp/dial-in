import type { Handle } from '@sveltejs/kit';

import { env as publicEnv } from '$env/dynamic/public';
const PUBLIC_BETTER_AUTH_URL = publicEnv.PUBLIC_BETTER_AUTH_URL || 'auth.staging.lofi';

export const handle: Handle = async ({ event, resolve }) => {
    // Initialize as null
    event.locals.session = null;
    event.locals.user = null;

    // Forward the session check to your actual auth service
    try {
        const response = await fetch(`${PUBLIC_BETTER_AUTH_URL}/api/auth/get-session`, {
            headers: {
                cookie: event.request.headers.get('cookie') || '',
            },
            credentials: 'include',
        });

        if (response.ok) {
            const data = await response.json();
            event.locals.session = data.session;
            event.locals.user = data.user;
        }
    } catch (error) {
        console.error('Failed to fetch session:', error);
    }

    return resolve(event);
};
