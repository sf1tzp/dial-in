<script lang="ts">
    import { browser } from '$app/environment';
    import { authClient } from '$lib/auth-client';
    import { coffeeBagStore, coffeeBrewStore, syncService } from '$lib/storage';
    import { exportDataLocally } from '$lib/export';
    import { Button } from '$lib/components/ui/button';
    import AlertTriangle from '@lucide/svelte/icons/alert-triangle';
    import ShieldCheck from '@lucide/svelte/icons/shield-check';
    import CloudUpload from '@lucide/svelte/icons/cloud-upload';
    import X from '@lucide/svelte/icons/x';

    const LOGIN_PAGE = '/login';

    const session = authClient.useSession();
    const syncStatus = $derived(syncService.status);

    const DISMISS_KEY = 'dial-in-durability-dismissed';
    const SYNCED_DISMISS_KEY = 'dial-in-durability-synced-dismissed';
    const UPGRADE_DISMISS_KEY = 'dial-in-durability-upgrade-dismissed';

    let unauthDismissed = $state(browser ? localStorage.getItem(DISMISS_KEY) === 'true' : false);
    let syncedDismissed = $state(browser ? localStorage.getItem(SYNCED_DISMISS_KEY) === 'true' : false);
    let upgradeDismissed = $state(browser ? localStorage.getItem(UPGRADE_DISMISS_KEY) === 'true' : false);

    const hasData = $derived(coffeeBagStore.items.length > 0 || coffeeBrewStore.items.length > 0);
    const isAuthenticated = $derived(!!$session.data?.user);
    const needsSubscription = $derived(syncStatus.lastError === 'Active subscription required');

    const showUnauthBanner = $derived(!isAuthenticated && hasData && !unauthDismissed);
    const showUpgradeBanner = $derived(isAuthenticated && needsSubscription && hasData && !upgradeDismissed);
    const showSyncedBanner = $derived(isAuthenticated && !needsSubscription && hasData && !syncedDismissed && !!syncStatus.lastSyncTime);

    function dismissUnauth() {
        localStorage.setItem(DISMISS_KEY, 'true');
        unauthDismissed = true;
    }

    function dismissSynced() {
        localStorage.setItem(SYNCED_DISMISS_KEY, 'true');
        syncedDismissed = true;
    }

    function dismissUpgrade() {
        localStorage.setItem(UPGRADE_DISMISS_KEY, 'true');
        upgradeDismissed = true;
    }

    function handleExport() {
        exportDataLocally(coffeeBagStore.items, coffeeBrewStore.items);
    }
</script>

{#if showUnauthBanner}
    <div class="relative mt-8 rounded-md border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-900 dark:text-amber-200">
        <button
            class="absolute right-2 top-2 rounded-sm p-0.5 text-amber-900/60 hover:text-amber-900 dark:text-amber-200/60 dark:hover:text-amber-200"
            onclick={dismissUnauth}
        >
            <X class="size-4" />
            <span class="sr-only">Dismiss</span>
        </button>
        <div class="flex items-start gap-3">
            <AlertTriangle class="mt-0.5 size-4 shrink-0" />
            <div>
                <p>Your data is stored locally in this browser and could be cleared by the OS. Sign in to sync, or export a backup.</p>
                <div class="mt-3 flex gap-2">
                    <Button variant="outline" size="sm" href={LOGIN_PAGE}>Sign In</Button>
                    <Button variant="outline" size="sm" onclick={handleExport}>Export Backup</Button>
                </div>
            </div>
        </div>
    </div>
{:else if showUpgradeBanner}
    <div class="relative mt-8 rounded-md border border-blue-500/20 bg-blue-500/10 p-4 text-sm text-blue-900 dark:text-blue-200">
        <button
            class="absolute right-2 top-2 rounded-sm p-0.5 text-blue-900/60 hover:text-blue-900 dark:text-blue-200/60 dark:hover:text-blue-200"
            onclick={dismissUpgrade}
        >
            <X class="size-4" />
            <span class="sr-only">Dismiss</span>
        </button>
        <div class="flex items-start gap-3">
            <CloudUpload class="mt-0.5 size-4 shrink-0" />
            <div>
                <p>Sync your brews across devices and back up your data to the cloud.</p>
                <div class="mt-3">
                    <Button variant="outline" size="sm" href="/account">Get Sync</Button>
                </div>
            </div>
        </div>
    </div>
{:else if showSyncedBanner}
    <div class="relative mt-8 rounded-md border border-green-500/20 bg-green-500/10 p-4 text-sm text-green-900 dark:text-green-200">
        <button
            class="absolute right-2 top-2 rounded-sm p-0.5 text-green-900/60 hover:text-green-900 dark:text-green-200/60 dark:hover:text-green-200"
            onclick={dismissSynced}
        >
            <X class="size-4" />
            <span class="sr-only">Dismiss</span>
        </button>
        <div class="flex items-start gap-3">
            <ShieldCheck class="mt-0.5 size-4 shrink-0" />
            <p>Your data is synced and backed up.</p>
        </div>
    </div>
{/if}
