<script lang="ts">
    import CircleUserRound from "@lucide/svelte/icons/circle-user-round";
    import { authClient } from "$lib/auth-client";
    import { goto } from "$app/navigation";
    import { syncService, setActiveUserId, reloadStores } from "$lib/storage";
    import SignOutDialog from "./sign-out-dialog.svelte";

    const session = authClient.useSession();

    const LOGIN_PAGE = '/login';

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
        goto("/");
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
    <a href={LOGIN_PAGE}>
        <CircleUserRound class="size-8 text-muted-foreground"/>
    </a>
{/if}
