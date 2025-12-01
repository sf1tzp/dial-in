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

	function getBrewTitle(date: Date): string {
		const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
		const hour = date.getHours();

		let timeOfDay: string;
		if (hour < 12) {
			timeOfDay = 'Morning';
		} else if (hour < 17) {
			timeOfDay = 'Afternoon';
		} else {
			timeOfDay = 'Evening';
		}

		return `${dayOfWeek} ${timeOfDay} Brew`;
	}
</script>

<div class="flex">
	<div class="my-4 ml-4 mr-4 sm:mx-12">
		<Coffee class="size-18 text-brew-icon" />
	</div>

	<div
		class="mt-3 cursor-pointer flex flex-col"
		onclick={() => detailDialogOpen = true}
		onkeydown={(e) => e.key === 'Enter' && (detailDialogOpen = true)}
		role="button"
		tabindex="0"
	>
		<h3 class="text-foreground font-semibold">
			{coffeeBrew ? getBrewTitle(coffeeBrew.createdAt) : 'Brew'}
		</h3>
		<h3 class="text-muted-foreground text-sm">
			{coffeeBag?.name}
		</h3>

		<div class="text-center flex justify-between gap-4 my-2">
			<div class="flex gap-2">
				<Cog class="size-6 text-muted-foreground"/>
				<p>{coffeeBrew?.grindSetting.toFixed(1)}</p>
			</div>
			<div class="flex gap-2">
				<Weight class="size-6 text-muted-foreground"/>
				<p>{coffeeBrew?.dryWeight}g </p>
			</div>
			<div class="flex gap-2">
				<Gauge class="size-6 text-muted-foreground"/>
				<p>{coffeeBrew?.pressureReading}%</p>
			</div>
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
				{coffeeBrew ? getBrewTitle(coffeeBrew.createdAt) : 'Brew'}
			</Dialog.Title>
		</Dialog.Header>
		<BrewDetail brew={coffeeBrew} {coffeeBag} />
	</Dialog.Content>
</Dialog.Root>
{/if}
