<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { page } from '$app/state';
  	import { Menu } from '$lib/components/menu';
	import { initializeStores } from '$lib/storage';
	import { onMount } from 'svelte';

	import CardViewIcon from '@lucide/svelte/icons/smartphone';

	import Profile from '$lib/components/profile.svelte';

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

<div class="fixed bottom-0 left-0 right-0 bg-background grid grid-cols-3 items-center py-4 border-t-2 sm:max-w-lg sm:mx-auto sm:gap-24">
	<div class="pl-4">
			<CardViewIcon class="size-8 text-muted-foreground"/>
	</div>

	<a href="https://fitz.gg">
		{@render FitzLogo({ fill: "var(--muted-foreground)", class: "w-28 sm:w-38" })}
	</a>

	<Profile/>
</div>

{#snippet FitzLogo({ fill = "currentColor", stroke = "none", class: className = "" })}
<svg class={className} viewBox="0 0 3700 882" xmlns="http://www.w3.org/2000/svg">
    <path fill={fill} stroke={stroke} d="M 1211 44 C 1168.163574 43.894775 1126.135986 46.93689 1085 52 C 1045.577515 57.066528 1010.873047 65.535767 980 78 C 947.41333 90.459229 920.895142 106.868164 902 126 C 883.106567 144.393066 874.067017 166.708252 874 194 L 874 268 C 874 268 41.026978 266.015381 41 266 L 98 359 L 874 361 L 872 831 L 1135 832 L 1136 362 L 1326 362 L 1325 832 L 1587 833 L 1588 363 L 1720 363 L 1719 702 C 1718.963867 716.752197 1723.759521 731.747681 1734 748 C 1745.957275 763.519531 1764.041992 777.401489 1788 790 C 1811.957031 802.598022 1843.609863 813.789917 1883 822 C 1924.103516 830.214722 1975.028076 833.852783 2035 834 L 2143 834 L 2816 836 L 2816 836 L 3593 838 L 3658 838 L 3592 731 L 2393 728 L 2818 366 L 2761 273 C 2445.749512 272.015869 2297.250732 271.78064 1982 271 L 1983 103 L 1720 102 L 1720 270 L 1136 269 L 1136 189 C 1136.063477 163.183838 1161.596191 150.873779 1213 151 L 1327 151 L 1589 151 L 1589 45 L 1332 45 Z M 1982 364 L 2129 364 L 2531 365 L 2114 728 C 2113.990479 728.005005 2084.577637 727.641602 2068 727 C 2049.152832 726.215454 2033.699463 723.722412 2020 720 C 2006.30127 716.27832 1995.83667 711.393188 1989 704 C 1983.878174 696.611938 1980.967285 686.277344 1981 673 Z"/>
</svg>
{/snippet}
{#snippet GridViewIcon({ stroke = "currentColor", class: className = "" })}
<svg class={className} viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
    <path fill="none" stroke={stroke} stroke-width="8" d="M 9.75 45.253731 C 9.75 48.968605 12.761497 51.980103 16.476368 51.980103 L 45.273632 51.980103 C 48.988503 51.980103 52 48.968605 52 45.253731 L 52 16.246269 C 52 12.531395 48.988503 9.519897 45.273632 9.519897 L 16.476368 9.519897 C 12.761497 9.519897 9.75 12.531395 9.75 16.246269 Z"/>
    <path fill="none" stroke={stroke} stroke-width="8" d="M 67.980202 45.267326 C 67.980202 48.98568 70.994522 52 74.712868 52 L 103.537132 52 C 107.255478 52 110.269798 48.98568 110.269798 45.267326 L 110.269798 16.232674 C 110.269798 12.51432 107.255478 9.5 103.537132 9.5 L 74.712868 9.5 C 70.994522 9.5 67.980202 12.51432 67.980202 16.232674 Z"/>
    <path fill="none" stroke={stroke} stroke-width="8" d="M 10 103.279999 C 10 106.991356 13.008647 110 16.719999 110 L 45.279999 110 C 48.991352 110 52 106.991356 52 103.279999 L 52 74.720001 C 52 71.008652 48.991352 68 45.279999 68 L 16.719999 68 C 13.008647 68 10 71.008652 10 74.720001 Z"/>
    <path fill="none" stroke={stroke} stroke-width="8" d="M 68 103.279999 C 68 106.991356 71.008644 110 74.720001 110 L 103.279999 110 C 106.991356 110 110 106.991356 110 103.279999 L 110 74.720001 C 110 71.008652 106.991356 68 103.279999 68 L 74.720001 68 C 71.008644 68 68 71.008652 68 74.720001 Z"/>
</svg>
{/snippet}