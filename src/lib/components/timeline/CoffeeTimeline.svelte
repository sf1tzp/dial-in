<script lang="ts">
    import Coffee from "@lucide/svelte/icons/coffee"
    import ClipboardList from "@lucide/svelte/icons/clipboard-list"
	import type { CoffeeBag, EspressoShot } from '$lib/storage/interfaces';
	import { Badge } from '$lib/components/ui/badge';
	import { Separator } from '$lib/components/ui/separator';
	import ScrollArea from '$lib/components/ui/scroll-area/scroll-area.svelte';

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

	function formatTime(date: Date): string {
		return date.toLocaleTimeString('en-US', {
			hour: 'numeric',
			minute: '2-digit',
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

<div class="coffee-timeline {className}">
	{#if sortedEntries.length === 0}
		<div class="text-muted-foreground flex flex-col items-center justify-center py-12 text-center">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="mb-4 h-12 w-12 opacity-50"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
				stroke-width="1.5"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
				/>
			</svg>
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

						<!-- Entry card -->
						<div
							class="bg-card border-border rounded-lg border p-4 shadow-sm transition-shadow hover:shadow-md"
						>
							<div class="mb-2 flex items-start justify-between gap-2">
								<div class="flex flex-wrap items-center gap-2">
									{#if entry.type === 'coffee-bag'}
										<Badge variant="secondary" class="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                                        <ClipboardList />
                                        Bag Opened
										</Badge>
									{:else}
										<Badge variant="secondary"  class="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                                            <Coffee class="size-2" />
                                            Coffee Brewed
										</Badge>
									{/if}
								</div>
								<span class="text-muted-foreground shrink-0 text-xs">
									{formatRelativeTime(entry.data.createdAt)}
								</span>
							</div>

							{#if entry.type === 'coffee-bag'}
								{@const bag = entry.data}
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
							{:else}
								{@const shot = entry.data}
								{@const coffeeBag = entry.coffeeBag}

								{#if coffeeBag}
									<h3 class="text-foreground mb-1 font-semibold">{coffeeBag.name}</h3>
									<p class="text-muted-foreground mb-2 text-xs">{coffeeBag.roasterName}</p>
								{/if}

								<div class="text-muted-foreground grid grid-cols-2 gap-x-4 gap-y-1 text-sm sm:grid-cols-3">
									<div>
										<span class="font-medium">Dose:</span>
										{shot.dryWeight}g
									</div>
									<div>
										<span class="font-medium">Time:</span>
										{shot.brewTime}s
									</div>
									<div>
										<span class="font-medium">Pressure:</span>
										{shot.pressureReading} bar
									</div>
									<div>
										<span class="font-medium">Grind:</span>
										{shot.grinderCoarseness}
									</div>
									<div>
										<span class="font-medium">Grind Time:</span>
										{shot.grinderTime}s
									</div>
								</div>

								{#if shot.notes}
									<Separator class="my-3" />
									<p class="text-muted-foreground text-sm italic">"{shot.notes}"</p>
								{/if}
							{/if}

							<div class="text-muted-foreground mt-3 flex items-center justify-end text-xs">
								<time datetime={entry.data.createdAt.toISOString()}>
									{formatDate(entry.data.createdAt)} at {formatTime(entry.data.createdAt)}
								</time>
							</div>
						</div>
					</li>
				{/each}
			</ul>
		</div>
	{/if}
</div>
