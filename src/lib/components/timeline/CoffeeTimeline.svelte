<script lang="ts">
	import BookOpen from '@lucide/svelte/icons/book-open';
	import type { CoffeeBag, EspressoShot } from '$lib/storage/interfaces';
	import BagEntry from './BagEntry.svelte';
	import BrewEntry from './BrewEntry.svelte';

	type TimelineEntry =
		| { type: 'coffee-bag'; data: CoffeeBag }
		| { type: 'espresso-shot'; data: EspressoShot; coffeeBag?: CoffeeBag };

	interface Props {
		entries: TimelineEntry[];
		class?: string;
	}

	let { entries, class: className = '' }: Props = $props();

	// Sort entries by createdAt in descending order (newest first)
	const sortedEntries = $derived(
		[...entries].sort((a, b) => {
			const dateA = a.data.createdAt.getTime();
			const dateB = b.data.createdAt.getTime();
			return dateB - dateA;
		})
	);

	function formatDate(date: Date): string {
		return date.toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
		});
	}

	function formatRelativeTime(date: Date): string {
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffMins = Math.floor(diffMs / (1000 * 60));
		const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
		const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

		if (diffMins < 1) return 'Just now';
		if (diffMins < 60) return `${diffMins}m ago`;
		if (diffHours < 24) return `${diffHours}h ago`;
		if (diffDays < 7) return `${diffDays}d ago`;
		return formatDate(date);
	}
</script>

<div class="">
	{#if sortedEntries.length === 0}
		<div class="text-muted-foreground flex flex-col items-center justify-center py-12 text-center">
            <BookOpen class="size-4"/>
			<p class="text-lg font-medium">No entries yet</p>
			<p class="text-sm">Add a coffee bag or log an espresso shot to get started</p>
		</div>
	{:else}
		<div class="relative">
			<!-- Timeline line -->
			<div
				class="bg-border absolute top-0 bottom-0 left-4 w-0.5 md:left-6"
				aria-hidden="true"
			></div>

			<ul class="space-y-6">
				{#each sortedEntries as entry (entry.data.id)}
					<li class="relative pl-10 md:pl-14">
						<!-- Timeline dot -->
						<div
							class="absolute left-2.5 top-1 flex h-3 w-3 items-center justify-center rounded-full md:left-4.5 {entry.type ===
							'coffee-bag'
								? 'bg-amber-500'
								: 'bg-emerald-500'}"
						>
							<div class="h-1.5 w-1.5 rounded-full bg-white"></div>
						</div>

						{#if entry.type === 'coffee-bag'}
							<BagEntry bag={entry.data} relativeTime={formatRelativeTime(entry.data.createdAt)} />
						{:else}
							<BrewEntry
								shot={entry.data}
								coffeeBag={entry.coffeeBag}
								relativeTime={formatRelativeTime(entry.data.createdAt)}
							/>
						{/if}
					</li>
				{/each}
			</ul>
		</div>
	{/if}
</div>
