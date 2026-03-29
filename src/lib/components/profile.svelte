<script lang="ts">
    import CircleUserRound from "@lucide/svelte/icons/circle-user-round";
    import { authClient } from "$lib/auth-client";
    import { goto } from "$app/navigation";
    import { resolve } from "$app/paths";
    import { syncService, setActiveUserId, reloadStores } from "$lib/storage";
    import SignOutDialog from "./sign-out-dialog.svelte";

    const session = authClient.useSession();

    import { env } from '$env/dynamic/public';
    const LOGIN_PAGE = env.PUBLIC_BETTER_AUTH_URL!;

    let signOutDialogOpen = $state(false);

    async function handleSignOut() {
        // If dirty data, force sync first
        if (syncService.hasDirtyData()) {
            await syncService.forceSyncBeforeSignOut();
        }

        syncService.clearSyncState();
        setActiveUserId(null);
        await authClient.signOut();
        await reloadStores();
        signOutDialogOpen = false;
        goto(resolve("/"));
    }
</script>

{#if $session.data}
    <button onclick={() => { signOutDialogOpen = true; }}>
        <CircleUserRound class="size-8 text-red-700/80"/>
    </button>

    <SignOutDialog
        bind:open={signOutDialogOpen}
        hasDirtyData={syncService.hasDirtyData()}
        onconfirm={handleSignOut}
        oncancel={() => { signOutDialogOpen = false; }}
    />
{:else}
    <a href={LOGIN_PAGE} rel="external">
        <CircleUserRound class="size-8 text-muted-foreground"/>
    </a>
{/if}
