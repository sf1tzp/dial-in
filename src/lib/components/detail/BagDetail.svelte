<script lang="ts">
	import ClipboardList from '@lucide/svelte/icons/clipboard-list';
	import type { CoffeeBag } from '$lib/storage/interfaces';
	import { Badge } from '$lib/components/ui/badge';
	import { Separator } from '$lib/components/ui/separator';

	interface Props {
		bag: CoffeeBag;
	}

	let { bag }: Props = $props();

	// Create object URL for blob images
	const imageUrl = $derived(
		bag.picture
			? typeof bag.picture === 'string'
				? bag.picture
				: URL.createObjectURL(bag.picture)
			: null
	);

	// Cleanup object URL when component is destroyed
	$effect(() => {
		return () => {
			if (imageUrl && bag.picture instanceof Blob) {
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
				alt={bag.name}
				class="h-full w-full object-cover"
			/>
		</div>
	{/if}

	<div class="space-y-3">
		<div class="flex items-center gap-2">
			<Badge
				variant="secondary"
				class="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200"
			>
				<ClipboardList class="mr-1 size-3" />
				Bag Opened
			</Badge>
		</div>

		<div>
			<h2 class="text-foreground text-2xl font-bold">{bag.name}</h2>
			<p class="text-muted-foreground text-lg">{bag.roasterName}</p>
		</div>

		{#if bag.style}
			<div class="text-foreground">
				<span class="text-muted-foreground font-medium">Style:</span>
				<span class="ml-2">{bag.style}</span>
			</div>
		{/if}

		<Separator />

		<div class="grid grid-cols-2 gap-4">
			<div>
				<p class="text-muted-foreground text-sm font-medium">Roasted</p>
				<p class="text-foreground">{bag.dateRoasted ? formatDate(bag.dateRoasted) : 'Not specified'}</p>
			</div>
			<div>
				<p class="text-muted-foreground text-sm font-medium">Opened</p>
				<p class="text-foreground">{bag.dateOpened ? formatDate(bag.dateOpened) : 'Not specified'}</p>
			</div>
		</div>

		{#if bag.notes}
			<Separator />
			<div>
				<p class="text-muted-foreground mb-1 text-sm font-medium">Notes</p>
				<p class="text-foreground italic">"{bag.notes}"</p>
			</div>
		{/if}

		<Separator />

		<div class="text-muted-foreground text-xs">
			<p>Created: {formatDate(bag.createdAt)} at {formatTime(bag.createdAt)}</p>
			{#if bag.updatedAt.getTime() !== bag.createdAt.getTime()}
				<p>Updated: {formatDate(bag.updatedAt)} at {formatTime(bag.updatedAt)}</p>
			{/if}
		</div>
	</div>
</div>
