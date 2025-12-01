<script lang="ts">
	import Coffee from '@lucide/svelte/icons/coffee';
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

	<div class="space-y-3">
		<div class="flex items-center gap-2">
			<Badge
				variant="secondary"
				class="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
			>
				<Coffee class="mr-1 size-3" />
				Coffee Brewed
			</Badge>
		</div>

		{#if coffeeBag}
			<div>
				<h2 class="text-foreground text-2xl font-bold">{coffeeBag.name}</h2>
				<p class="text-muted-foreground">{coffeeBag.roasterName}</p>
			</div>
		{/if}

		<Separator />

		<div class="grid grid-cols-2 gap-4">
			<div>
				<p class="text-muted-foreground text-sm font-medium">Grind Setting</p>
				<p class="text-foreground text-xl font-semibold">{brew.grindSetting}</p>
			</div>
			<div>
				<p class="text-muted-foreground text-sm font-medium">Dry Weight</p>
				<p class="text-foreground text-xl font-semibold">{brew.dryWeight}g</p>
			</div>
			<div>
				<p class="text-muted-foreground text-sm font-medium">Brew Time</p>
				<p class="text-foreground text-xl font-semibold">{brew.brewTime}s</p>
			</div>
			<div>
				<p class="text-muted-foreground text-sm font-medium">Pressure</p>
				<p class="text-foreground text-xl font-semibold">{brew.pressureReading}%</p>
			</div>
		</div>

		{#if brew.notes}
			<Separator />
			<div>
				<p class="text-muted-foreground mb-1 text-sm font-medium">Notes</p>
				<p class="text-foreground italic">"{brew.notes}"</p>
			</div>
		{/if}

		<Separator />

		<div class="text-muted-foreground text-xs">
			<p>Created: {formatDate(brew.createdAt)} at {formatTime(brew.createdAt)}</p>
			{#if brew.updatedAt.getTime() !== brew.createdAt.getTime()}
				<p>Updated: {formatDate(brew.updatedAt)} at {formatTime(brew.updatedAt)}</p>
			{/if}
		</div>
	</div>
</div>
