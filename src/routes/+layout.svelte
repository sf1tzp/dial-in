<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
  	import { Menu } from '$lib/components/menu';
	import {
		initializeStores,
		syncService,
		setActiveUserId,
		reloadStores,
		coffeeBagStore,
		coffeeBrewStore,
	} from '$lib/storage';
	import { onMount, onDestroy } from 'svelte';
	import { authClient } from '$lib/auth-client';
	import AdoptDataDialog from '$lib/components/adopt-data-dialog.svelte';

import { ModeWatcher } from "mode-watcher";

	let { children } = $props();

	let storesReady = $state(false);

	// Track auth state for sync and user transitions
	const session = authClient.useSession();
	let previousUserId: string | null | undefined = undefined; // undefined = not yet initialized

	// Adoption dialog state
	let adoptDialogOpen = $state(false);
	let orphanedBagCount = $state(0);
	let orphanedBrewCount = $state(0);

	// React to auth state changes — bridge auth to storage
	$effect(() => {
		const currentUserId = $session.data?.user?.id ?? null;

		// Skip until stores are ready and session has resolved at least once
		if (!storesReady || $session.isPending) return;

		// Skip the initial assignment
		if (previousUserId === undefined) {
			previousUserId = currentUserId;
			return;
		}

		// Detect user transition
		if (currentUserId !== previousUserId) {
			previousUserId = currentUserId;
			handleUserChange(currentUserId);
		}
	});

	async function handleUserChange(userId: string | null) {
		setActiveUserId(userId);
		await reloadStores();

		if (userId) {
			// User just signed in — start sync and check for orphaned data
			syncService.startAutoSync();
			await checkForOrphanedData();
		} else {
			// User signed out — stop sync
			syncService.stopAutoSync();
		}
	}

	async function checkForOrphanedData() {
		const orphanedBags = await coffeeBagStore.getOrphanedItems();
		const orphanedBrews = await coffeeBrewStore.getOrphanedItems();

		if (orphanedBags.length > 0 || orphanedBrews.length > 0) {
			orphanedBagCount = orphanedBags.length;
			orphanedBrewCount = orphanedBrews.length;
			adoptDialogOpen = true;
		}
	}

	async function handleAdopt() {
		const userId = $session.data?.user?.id;
		if (!userId) return;

		await coffeeBagStore.adoptItems(userId);
		await coffeeBrewStore.adoptItems(userId);
		adoptDialogOpen = false;
	}

	function handleDeclineAdopt() {
		adoptDialogOpen = false;
	}


	onMount(async () => {
		// Set active user before first store load so data is user-scoped from the start
		const currentSession = $session.data;
		if (currentSession?.user?.id) {
			setActiveUserId(currentSession.user.id);
		}
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

<footer class="py-4 text-center text-sm text-muted-foreground">
	<a href={resolve('/privacy')} class="hover:underline">Privacy</a>
	<span class="mx-1">·</span>
	<a href={resolve('/terms')} class="hover:underline">Terms</a>
</footer>

<div class="fixed bottom-0 left-0 right-0 bg-background grid grid-cols-3 items-center py-4 border-t-2 sm:max-w-lg sm:mx-auto sm:gap-24">

</div>

<AdoptDataDialog
	bind:open={adoptDialogOpen}
	bagCount={orphanedBagCount}
	brewCount={orphanedBrewCount}
	onadopt={handleAdopt}
	ondecline={handleDeclineAdopt}
/>
