<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { page } from '$app/state';
  	import { Menu } from '$lib/components/menu';
	import { initializeStores, syncService } from '$lib/storage';
	import { onMount, onDestroy } from 'svelte';
	import { authClient } from '$lib/auth-client';

	import CardViewIcon from '@lucide/svelte/icons/smartphone';

	import SyncStatus from '$lib/components/sync-status.svelte';

	import { ModeWatcher } from "mode-watcher";

	let { children } = $props();

	let storesReady = $state(false);

	// Track auth state for sync
	const session = authClient.useSession();

	// Start/stop sync based on auth state
	$effect(() => {
		if (storesReady && $session.data?.user) {
			// User is authenticated - start auto sync
			syncService.startAutoSync();
		} else {
			// User signed out - stop sync
			syncService.stopAutoSync();
		}
	});

	onMount(async () => {
		await initializeStores();
		storesReady = true;
	});

	onDestroy(() => {
		syncService.stopAutoSync();
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<ModeWatcher />

<Menu currentPath={page.url.pathname}/>

<main class="container mx-auto px-4 py-4 lg:max-w-6xl">
	{#if storesReady}
		{@render children?.()}
	{:else}
		<div class="flex items-center justify-center min-h-[50vh]">
			<div class="animate-pulse text-muted-foreground">Loading...</div>
		</div>
	{/if}
</main>

<div class="fixed bottom-0 left-0 right-0 bg-background grid grid-cols-3 items-center py-4 border-t-2 sm:max-w-lg sm:mx-auto sm:gap-24">

</div>
