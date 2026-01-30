import { auth } from "$lib/server/auth";
import { svelteKitHandler } from "better-auth/svelte-kit";
import { building } from "$app/environment";

import { env as publicEnv } from "$env/dynamic/public";
const PUBLIC_BETTER_AUTH_URL = publicEnv.PUBLIC_BETTER_AUTH_URL || "auth.staging.lofi";


export async function handle({ event, resolve }) {
  // Forward the session check to your actual auth service
  try {
    const response = await fetch(`${PUBLIC_BETTER_AUTH_URL}/api/auth/get-session`, {
      headers: {
        cookie: event.request.headers.get("cookie") || "",
      },
      credentials: "include",
    });

    if (response.ok) {
      const data = await response.json();
      event.locals.session = data.session;
      event.locals.user = data.user;
    }
  } catch (error) {
    console.error("Failed to fetch session:", error);
  }


  return svelteKitHandler({ event, resolve, auth, building });
}