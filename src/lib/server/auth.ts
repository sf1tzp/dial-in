import { betterAuth } from "better-auth";

import { env as publicEnv } from "$env/dynamic/public";
const PUBLIC_BETTER_AUTH_URL = publicEnv.PUBLIC_BETTER_AUTH_URL || "auth.staging.lofi";

import { env } from "$env/dynamic/private";
const COOKIE_DOMAIN = env.COOKIE_DOMAIN || ".staging.lofi";

export const auth = betterAuth({
  baseURL: PUBLIC_BETTER_AUTH_URL,
  fetchOptions: {
    credentials: "include", // Required for cross-origin cookies
  },
  advanced: {
    crossSubDomainCookies: {
      domain: COOKIE_DOMAIN,
      enabled: true,
    },
  },
  trustedOrigins: [PUBLIC_BETTER_AUTH_URL]
});