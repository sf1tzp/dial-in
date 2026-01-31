import { createAuthClient } from 'better-auth/svelte';
import {
    adminClient,
    magicLinkClient,
    inferAdditionalFields,
} from 'better-auth/client/plugins';

import { env as publicEnv } from '$env/dynamic/public';
const PUBLIC_BETTER_AUTH_URL =
    publicEnv.PUBLIC_BETTER_AUTH_URL || 'auth.staging.lofi';

export const authClient = createAuthClient({
    baseURL: PUBLIC_BETTER_AUTH_URL,
    fetchOptions: {
        credentials: 'include', // Required for cross-origin cookies
    },
    plugins: [
        adminClient(),
        magicLinkClient(),
        inferAdditionalFields({
            user: { role: { type: 'string' } },
            // add other fields as needed
        }),
    ],
});

export const { signIn, signUp, signOut, useSession } = authClient;
export type Session = typeof authClient.$Infer.Session;
export type User = Session['user'];
