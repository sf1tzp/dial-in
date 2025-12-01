<script lang="ts">
	import ClipboardList from '@lucide/svelte/icons/clipboard-list';
    import Heater from '@lucide/svelte/icons/heater';
	import Coffee from '@lucide/svelte/icons/coffee';
    import ServerCog from '@lucide/svelte/icons/server-cog';
    import Cog from '@lucide/svelte/icons/cog';
    import Weight from '@lucide/svelte/icons/weight';
    import Timer from '@lucide/svelte/icons/timer';
    import Gauge from '@lucide/svelte/icons/gauge';
    import ScrollText from '@lucide/svelte/icons/scroll-text';
	import type { CoffeeBag, CoffeeBrew } from '$lib/storage/interfaces';
	import { Badge } from '$lib/components/ui/badge';
	import { Separator } from '$lib/components/ui/separator';

	interface Props {
		brew: CoffeeBrew;
		coffeeBag?: CoffeeBag;
	}

	let { brew, coffeeBag }: Props = $props();

	// Create object URL for blob images
	const imageUrl = $derived(
		brew.picture
			? typeof brew.picture === 'string'
				? brew.picture
				: URL.createObjectURL(brew.picture)
			: null
	);

	// Cleanup object URL when component is destroyed
	$effect(() => {
		return () => {
			if (imageUrl && brew.picture instanceof Blob) {
				URL.revokeObjectURL(imageUrl);
			}
		};
	});

	function formatDate(date: Date): string {
		return date.toLocaleDateString('en-US', {
			weekday: 'short',
			month: 'short',
			day: 'numeric',
			year: 'numeric',
		});
	}

	function formatTime(date: Date): string {
		return date.toLocaleTimeString('en-US', {
			hour: 'numeric',
			minute: '2-digit',
		});
	}
</script>

<div class="space-y-4">
	{#if imageUrl}
		<div class="relative aspect-video w-full overflow-hidden rounded-lg">
			<img
				src={imageUrl}
				alt={coffeeBag ? `${coffeeBag.name} brew` : 'Brew'}
				class="h-full w-full object-cover"
			/>
		</div>
	{/if}

	<div class="space-y-4">

		{#if coffeeBag}
			<div>
				<h2 class="text-foreground text-2xl font-bold">
                    <!-- <ClipboardList class="size-4 align-baseline inline-block "/> -->
                    {coffeeBag.name}
                </h2>
				<p class="text-muted-foreground">
                    <!-- <Heater class="size-3 align-baseline inline-block "/> -->
                    {coffeeBag.roasterName}
                </p>
			</div>
		{/if}

		<div class="grid grid-cols-2 gap-4">
			<div>
				<p class="text-muted-foreground text-sm font-medium">
                    Grind Setting
                </p>
				<p class="text-foreground text-xl font-semibold">
                <Cog class="size-3 align-baseline inline-block text-muted-foreground " />
                    {brew.grindSetting}</p>
			</div>
			<div>
				<p class="text-muted-foreground text-sm font-medium">Dry Weight</p>
				<p class="text-foreground text-xl font-semibold">

                    <Weight class="size-3 align-baseline inline-block text-muted-foreground " />
                    {brew.dryWeight}g
                </p>
			</div>
			<div>
				<p class="text-muted-foreground text-sm font-medium">Brew Time</p>
				<p class="text-foreground text-xl font-semibold">

                    <Timer class="size-3 align-baseline inline-block text-muted-foreground " />
                    {brew.brewTime}s</p>
			</div>
			<div>
				<p class="text-muted-foreground text-sm font-medium">Pressure</p>
				<p class="text-foreground text-xl font-semibold">

                    <Gauge class="size-3 align-baseline inline-block text-muted-foreground " />
                    {brew.pressureReading}%</p>
			</div>
		</div>

		{#if brew.notes}
			<div>
				<p class="text-muted-foreground mb-1 text-sm font-medium">
                    <ScrollText class="size-3 inline-block text-muted-foreground " />
                    Notes</p>
				<p class="text-foreground italic">"{brew.notes}"</p>
			</div>
		{/if}

        <div class="text-muted-foreground text-xs text-end">
			<p>Added: {formatDate(brew.createdAt)} at {formatTime(brew.createdAt)}</p>
			{#if brew.updatedAt.getTime() !== brew.createdAt.getTime()}
				<p>Updated: {formatDate(brew.updatedAt)} at {formatTime(brew.updatedAt)}</p>
			{/if}
		</div>

	</div>
</div>
