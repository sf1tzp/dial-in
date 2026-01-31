<script lang="ts">
    import CircleUserRound from "@lucide/svelte/icons/circle-user-round";
    import Upload from "@lucide/svelte/icons/upload";

	import { authClient } from "$lib/auth-client";
    import { redirect } from "@sveltejs/kit";
    import { goto } from "$app/navigation";
    import { syncService } from "$lib/storage";
	const session = authClient.useSession();

    import { env } from '$env/dynamic/public';
    const LOGIN_PAGE = env.PUBLIC_BETTER_AUTH_URL!;

</script>

{#if $session.data}
    <button
        onclick={async () => {
            syncService.clearSyncState();
            await authClient.signOut();
            goto("/");
        }}
    >
        <CircleUserRound class="size-8 text-red-700/80"/>
    </button>
{:else}
    <a href={LOGIN_PAGE}>
        <CircleUserRound class="size-8 text-muted-foreground"/>
    </a>
{/if}