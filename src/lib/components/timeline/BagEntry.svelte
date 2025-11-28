<script lang="ts">
	import ClipboardList from '@lucide/svelte/icons/clipboard-list';
	import type { CoffeeBag } from '$lib/storage/interfaces';
	import { Badge } from '$lib/components/ui/badge';
	import { Separator } from '$lib/components/ui/separator';

	interface Props {
		bag: CoffeeBag;
		relativeTime: string;
	}

	let { bag, relativeTime }: Props = $props();

	function formatDate(date: Date): string {
		return date.toLocaleDateString('en-US', {
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

<div class="bg-card border-border rounded-lg border p-4 shadow-sm transition-shadow hover:shadow-md">
	<div class="mb-2 flex items-start justify-between gap-2">
		<div class="flex flex-wrap items-center gap-2">
			<Badge
				variant="secondary"
				class="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200"
			>
				<ClipboardList />
				Bag Opened
			</Badge>
		</div>
		<span class="text-muted-foreground shrink-0 text-xs">
			{relativeTime}
		</span>
	</div>

	<h3 class="text-foreground mb-1 text-lg font-semibold">{bag.name}</h3>
	<p class="text-muted-foreground mb-2 text-sm">{bag.roasterName}</p>

	<div class="text-muted-foreground grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
		<div>
			<span class="font-medium">Style:</span>
			{bag.style}
		</div>
		<div>
			<span class="font-medium">Roasted:</span>
			{formatDate(bag.dateRoasted)}
		</div>
		<div>
			<span class="font-medium">Opened:</span>
			{formatDate(bag.dateOpened)}
		</div>
	</div>

	{#if bag.notes}
		<Separator class="my-3" />
		<p class="text-muted-foreground text-sm italic">"{bag.notes}"</p>
	{/if}

	<div class="text-muted-foreground mt-3 flex items-center justify-end text-xs">
		<time datetime={bag.createdAt.toISOString()}>
			{formatDate(bag.createdAt)} at {formatTime(bag.createdAt)}
		</time>
	</div>
</div>
