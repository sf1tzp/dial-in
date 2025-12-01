<script lang="ts">
	import Coffee from '@lucide/svelte/icons/coffee';
	import type { CoffeeBag, CoffeeBrew } from '$lib/storage/interfaces';
	import { Badge } from '$lib/components/ui/badge';
	import { Separator } from '$lib/components/ui/separator';
	import { Swiper } from '$lib/components/ui/swiper';

	interface Props {
		coffeeBrew?: CoffeeBrew;
		coffeeBag?: CoffeeBag;
		relativeTime: string;
		onEdit?: (brew: CoffeeBrew) => void;
		onDelete?: (brew: CoffeeBrew) => void;
	}

	let { coffeeBrew, coffeeBag, relativeTime, onEdit, onDelete }: Props = $props();

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

<Swiper ondelete={() => coffeeBrew && onDelete?.(coffeeBrew)} onedit={() => coffeeBrew && onEdit?.(coffeeBrew)} class="bg-card border-border rounded-lg border shadow-sm transition-shadow hover:shadow-md">
	<div class="p-4">
	<div class="mb-2 flex items-start justify-between gap-2">
		<div class="flex flex-wrap items-center gap-2">
			<Badge
				variant="secondary"
				class="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
			>
				<Coffee class="size-2" />
				Coffee Brewed
			</Badge>
		</div>
		<span class="text-muted-foreground shrink-0 text-xs">
			{relativeTime}
		</span>
	</div>

	{#if coffeeBag}
		<h3 class="text-foreground mb-1 font-semibold">{coffeeBag.name}</h3>
		<p class="text-muted-foreground mb-2 text-xs">{coffeeBag.roasterName}</p>
	{/if}

	<div class="text-muted-foreground grid grid-cols-2 gap-x-4 gap-y-1 text-sm sm:grid-cols-3">
		<div>
			<span class="font-medium">Grind Setting:</span>
			{coffeeBrew?.grindSetting}
		</div>
		<div>
			<span class="font-medium">Dry Weight:</span>
			{coffeeBrew?.dryWeight}g
		</div>
		<div>
			<span class="font-medium">Brew Time:</span>
			{coffeeBrew?.brewTime}s
		</div>
		<div>
			<span class="font-medium">Pressure:</span>
			{coffeeBrew?.pressureReading}%
		</div>
	</div>

	{#if coffeeBrew?.notes}
		<Separator class="my-3" />
		<p class="text-muted-foreground text-sm italic">"{coffeeBrew?.notes}"</p>
	{/if}

	{#if coffeeBrew?.createdAt}
	<div class="text-muted-foreground mt-3 flex items-center justify-end text-xs">
		<time datetime={coffeeBrew.createdAt.toISOString()}>
			{formatDate(coffeeBrew.createdAt)} at {formatTime(coffeeBrew.createdAt)}
		</time>
	</div>
	{/if}
	</div>
</Swiper>
