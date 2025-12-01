<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { page } from '$app/state';
  	import { Menu } from '$lib/components/menu';
	import { initializeStores } from '$lib/storage';
	import { onMount } from 'svelte';

	import { ModeWatcher } from "mode-watcher";

	let { children } = $props();

	let storesReady = $state(false);

	onMount(async () => {
		await initializeStores();
		storesReady = true;
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
