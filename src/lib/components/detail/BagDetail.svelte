<script lang="ts">
	import ClipboardList from '@lucide/svelte/icons/clipboard-list';
    import CalendarClock from '@lucide/svelte/icons/calendar-clock';
    import CalendarCheck2 from '@lucide/svelte/icons/calendar-check-2';
    import ScrollText from '@lucide/svelte/icons/scroll-text';
	import type { CoffeeBag } from '$lib/storage/interfaces';
	import { Badge } from '$lib/components/ui/badge';
	import { Separator } from '$lib/components/ui/separator';
    import Heater from '@lucide/svelte/icons/heater';

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

	<div class="space-y-4">
		<div>
			<h2 class="text-foreground text-2xl font-bold">{bag.name}</h2>
			<p class="text-muted-foreground text-lg">{bag.roasterName}</p>
		</div>

		<div class="grid grid-cols-2 gap-4">
			<div>
				<p class="text-muted-foreground text-sm font-medium">
                    <Heater class="size-3 align-baseline inline-block text-muted-foreground " />
					Roasted On</p>
				<p class="text-foreground font-semibold">
                    {bag.dateRoasted ? formatDate(bag.dateRoasted) : 'Not specified'}</p>
			</div>
			<div>
				<p class="text-muted-foreground text-sm font-medium">
                    <CalendarCheck2 class="size-3 align-baseline inline-block text-muted-foreground " />
					Opened On</p>
				<p class="text-foreground font-semibold">
                    {bag.dateOpened ? formatDate(bag.dateOpened) : 'Not specified'}</p>
			</div>
		</div>

		{#if bag.style}
			<div class="text-foreground">
				<span class="text-muted-foreground font-medium">Style:</span>
				<span class="ml-2">{bag.style}</span>
			</div>
		{/if}

		{#if bag.notes}
			<div class="mt-4">
				<p class="text-foreground italic">"{bag.notes}"</p>
			</div>
		{/if}


		<div class="text-muted-foreground text-xs text-end">
			{#if bag.updatedAt.getTime() !== bag.createdAt.getTime()}
				<p>Updated: {formatDate(bag.updatedAt)} at {formatTime(bag.updatedAt)}</p>
			{/if}
		</div>
	</div>
</div>
