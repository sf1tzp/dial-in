import { betterAuth } from "better-auth";

import { env as publicEnv } from "$env/dynamic/public";
const PUBLIC_BETTER_AUTH_URL = publicEnv.PUBLIC_BETTER_AUTH_URL || "auth.staging.lofi";

import { env } from "$env/dynamic/private";

export const auth = betterAuth({
  baseURL: PUBLIC_BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET
});