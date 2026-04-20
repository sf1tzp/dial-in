import { createAuthClient } from 'better-auth/svelte';
import {
    adminClient,
    magicLinkClient,
    inferAdditionalFields,
} from 'better-auth/client/plugins';

export const authClient = createAuthClient({
    plugins: [
        adminClient(),
        magicLinkClient(),
        inferAdditionalFields({
            user: { role: { type: 'string' } },
        }),
    ],
});

export const { signIn, signUp, signOut, useSession } = authClient;
export type Session = typeof authClient.$Infer.Session;
export type User = Session['user'];
