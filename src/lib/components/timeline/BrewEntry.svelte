<script lang="ts">
	import Coffee from '@lucide/svelte/icons/coffee';
	import type { CoffeeBag, EspressoShot } from '$lib/storage/interfaces';
	import { Badge } from '$lib/components/ui/badge';
	import { Separator } from '$lib/components/ui/separator';

	interface Props {
		shot: EspressoShot;
		coffeeBag?: CoffeeBag;
		relativeTime: string;
	}

	let { shot, coffeeBag, relativeTime }: Props = $props();

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

	<div class="text-muted-foreground mt-3 flex items-center justify-end text-xs">
		<time datetime={shot.createdAt.toISOString()}>
			{formatDate(shot.createdAt)} at {formatTime(shot.createdAt)}
		</time>
	</div>
</div>
