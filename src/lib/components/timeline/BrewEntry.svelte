<script lang="ts">
	import Coffee from '@lucide/svelte/icons/coffee';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import type { CoffeeBag, CoffeeBrew } from '$lib/storage/interfaces';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';

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

<div class="bg-card border-border rounded-lg border p-4 shadow-sm transition-shadow hover:shadow-md">
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
	<div class="text-muted-foreground mt-3 flex items-center justify-between text-xs">
		<div class="flex gap-1">
			<Button variant="ghost" size="icon-sm" onclick={() => coffeeBrew && onEdit?.(coffeeBrew)} aria-label="Edit brew">
				<Pencil class="size-4" />
			</Button>
			<Button variant="ghost" size="icon-sm" onclick={() => coffeeBrew && onDelete?.(coffeeBrew)} aria-label="Delete brew">
				<Trash2 class="size-4" />
			</Button>
		</div>
		<time datetime={coffeeBrew.createdAt.toISOString()}>
			{formatDate(coffeeBrew.createdAt)} at {formatTime(coffeeBrew.createdAt)}
		</time>
	</div>
	{/if}
</div>
