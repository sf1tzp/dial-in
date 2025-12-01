<script lang="ts">
	import Coffee from '@lucide/svelte/icons/coffee';
	import type { CoffeeBag, CoffeeBrew } from '$lib/storage/interfaces';
	import { Badge } from '$lib/components/ui/badge';
	import { Separator } from '$lib/components/ui/separator';
	import * as Dialog from '$lib/components/ui/dialog';
	import { BrewDetail } from '$lib/components/detail';

	interface Props {
		coffeeBrew?: CoffeeBrew;
		coffeeBag?: CoffeeBag;
		relativeTime: string;
	}

	let { coffeeBrew, coffeeBag, relativeTime }: Props = $props();

	let detailDialogOpen = $state(false);

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

<div
	class="p-4 cursor-pointer"
	onclick={() => detailDialogOpen = true}
	onkeydown={(e) => e.key === 'Enter' && (detailDialogOpen = true)}
	role="button"
	tabindex="0"
>
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

{#if coffeeBrew}
<Dialog.Root bind:open={detailDialogOpen}>
	<Dialog.Content class="max-h-[90vh] overflow-y-auto">
		<Dialog.Header>
			<Dialog.Title class="flex items-center justify-center gap-2">
				<Coffee class="size-5" />
				Brew Details
			</Dialog.Title>
		</Dialog.Header>
		<BrewDetail brew={coffeeBrew} {coffeeBag} />
	</Dialog.Content>
</Dialog.Root>
{/if}
