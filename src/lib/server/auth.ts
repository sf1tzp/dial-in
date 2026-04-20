import { betterAuth } from 'better-auth';
import { magicLink } from 'better-auth/plugins/magic-link';
import { admin } from 'better-auth/plugins/admin';
import { pool } from '$lib/server/db/connection';
import { env } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';

export const auth = betterAuth({
    database: pool,
    secret: env.BETTER_AUTH_SECRET,
    baseURL: publicEnv.PUBLIC_BETTER_AUTH_URL,
    emailAndPassword: { enabled: false },
    user: {
        additionalFields: {
            role: {
                type: 'string',
                defaultValue: 'user',
            },
        },
    },
    plugins: [
        magicLink({
            sendMagicLink: async ({ email, url }) => {
                const res = await fetch('https://api.resend.com/emails', {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${env.RESEND_API_KEY}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        from: env.EMAIL_FROM || 'Dial-in <noreply@dial-in.coffee>',
                        to: email,
                        subject: 'Sign in to Dial-in',
                        html: `<a href="${url}">Click here to sign in to Dial-in</a>`,
                    }),
                });
                if (!res.ok) {
                    console.error(
                        'Failed to send magic link:',
                        await res.text()
                    );
                }
            },
        }),
        admin(),
    ],
    trustedOrigins: publicEnv.PUBLIC_BETTER_AUTH_URL
        ? [publicEnv.PUBLIC_BETTER_AUTH_URL]
        : [],
});
