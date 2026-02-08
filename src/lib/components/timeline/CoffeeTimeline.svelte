<script lang="ts">
	import BookOpen from '@lucide/svelte/icons/book-open';
	import type { CoffeeBag, CoffeeBrew } from '$lib/storage/interfaces';
	import BagEntry from './BagEntry.svelte';
	import BrewEntry from './BrewEntry.svelte';
	import TimelineEntry from './TimelineEntry.svelte';

	type TimelineItem =
		| { type: 'coffee-bag'; data: CoffeeBag }
		| { type: 'coffee-brew'; data: CoffeeBrew; coffeeBag?: CoffeeBag };

	interface Props {
		entries: TimelineItem[];
		class?: string;
		onEditBag?: (bag: CoffeeBag) => void;
		onDeleteBag?: (bag: CoffeeBag) => void;
		onEditBrew?: (brew: CoffeeBrew) => void;
		onDeleteBrew?: (brew: CoffeeBrew) => void;
		onArchiveBag?: (bag: CoffeeBag) => void;
		onUnarchiveBag?: (bag: CoffeeBag) => void;
	}

	let { entries, class: className = '', onEditBag, onDeleteBag, onEditBrew, onDeleteBrew, onArchiveBag, onUnarchiveBag }: Props = $props();

	// Extract all bags for disambiguation
	const allBags = $derived(
		entries.filter((e): e is { type: 'coffee-bag'; data: CoffeeBag } => e.type === 'coffee-bag').map((e) => e.data)
	);

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

	{#if sortedEntries.length === 0}
		<div class="text-muted-foreground flex flex-col items-center justify-center py-12 text-center">
            <BookOpen class="size-4"/>
			<p class="text-lg font-medium">No entries yet</p>
			<p class="text-sm">Open a bag of coffee to get started</p>
		</div>
	{:else}
		<p class="text-center text-muted-foreground text-sm italic mb-2 md:hidden">Swipe left or right to edit or delete</p>
		<div class="relative">
			<!-- Timeline line - centered and behind content -->
			<div
				class="bg-border absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2"
				aria-hidden="true"
			></div>

			<ul class="relative z-10 space-y-4 m-4">
				{#each sortedEntries as entry (entry.data.id)}
					<li>
						{#if entry.type === 'coffee-bag'}
							<TimelineEntry
								onedit={() => onEditBag?.(entry.data)}
								ondelete={() => onDeleteBag?.(entry.data)}
							>
								<BagEntry
									bag={entry.data}
									{allBags}
									relativeTime={formatRelativeTime(entry.data.createdAt)}
									onarchive={onArchiveBag ? () => onArchiveBag(entry.data) : undefined}
									onunarchive={onUnarchiveBag ? () => onUnarchiveBag(entry.data) : undefined}
								/>
							</TimelineEntry>
						{:else}
							<TimelineEntry
								onedit={() => onEditBrew?.(entry.data)}
								ondelete={() => onDeleteBrew?.(entry.data)}
							>
								<BrewEntry
									coffeeBrew={entry.data}
									coffeeBag={entry.coffeeBag}
									{allBags}
									relativeTime={formatRelativeTime(entry.data.createdAt)}
								/>
							</TimelineEntry>
						{/if}
					</li>
				{/each}
			</ul>
		</div>
	{/if}
