<script lang="ts">
	import Coffee from '@lucide/svelte/icons/coffee';
	import type { CoffeeBag, CoffeeBrew } from '$lib/storage/interfaces';
	import { Badge } from '$lib/components/ui/badge';
	import { Separator } from '$lib/components/ui/separator';
	import * as Dialog from '$lib/components/ui/dialog';
	import { BrewDetail } from '$lib/components/detail';
    import Gauge from '@lucide/svelte/icons/gauge';
    import Weight from '@lucide/svelte/icons/weight';
    import Cog from '@lucide/svelte/icons/cog';

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
	</div>

	{#if coffeeBag}
		<!-- interpolate a name based on the createdDate "Saturday Morning Brew" -->
		<div class="flex justify-between my-4">
			<h3 class="text-foreground font-semibold">
				{coffeeBag.name}
			</h3>
			<span class="pt-2 text-muted-foreground text-end text-xs align-baseline ">
				{relativeTime}
			</span>
		</div>
	{/if}

	<div class="mt-4 text-muted-foreground flex text-sm justify-between">
		<div class="m-2">
			<Cog class="size-4 text-foreground text-bold inline-block align-text-top  mr-2 "/>
			{coffeeBrew?.grindSetting}
		</div>
		<div class="m-2">
			<Weight class="size-4 text-foreground text-bold align-text-top inline-block mr-2"/>
			{coffeeBrew?.dryWeight}g
		</div>
		<div class="m-2">
			<Gauge class="size-4 text-foreground text-bold align-text-top inline-block mr-2"/>
			{coffeeBrew?.pressureReading}%
		</div>
	</div>
</div>

{#if coffeeBrew}
<Dialog.Root bind:open={detailDialogOpen}>
	<Dialog.Content class="max-h-[90vh] overflow-y-auto">
		<Dialog.Header>
			<Dialog.Title class="flex items-center justify-center gap-2">
				<Coffee class="size-5 text-bold inline-block align-text-top" />
				<!-- interpolate a name based on the createdDate "Saturday Morning Brew" -->
				Brew Details
			</Dialog.Title>
		</Dialog.Header>
		<BrewDetail brew={coffeeBrew} {coffeeBag} />
	</Dialog.Content>
</Dialog.Root>
{/if}
