<script lang="ts">
	import ClipboardList from '@lucide/svelte/icons/clipboard-list';
	import Flame from '@lucide/svelte/icons/flame';
	import Calendar from '@lucide/svelte/icons/calendar';
	import PackageOpen from '@lucide/svelte/icons/package-open';
	import type { CoffeeBag } from '$lib/storage/interfaces';
	import { getBagDisambiguator } from '$lib/bags';
	import * as Dialog from '$lib/components/ui/dialog';
	import { BagDetail } from '$lib/components/detail';

	interface Props {
		bag: CoffeeBag;
		allBags: CoffeeBag[];
		relativeTime: string;
	}

	let { bag, allBags, relativeTime }: Props = $props();

	const disambiguator = $derived(getBagDisambiguator(bag, allBags));

	let detailDialogOpen = $state(false);

	function formatDate(date: Date): string {
		return date.toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
		});
	}
</script>

<div class="flex">
	<div class="my-4 ml-3 mr-5 sm:ml-11 sm:mr-13">
		<ClipboardList class="size-18 text-bag-icon" />
	</div>

	<div
		class="mt-3 cursor-pointer flex flex-col"
		onclick={() => detailDialogOpen = true}
		onkeydown={(e) => e.key === 'Enter' && (detailDialogOpen = true)}
		role="button"
		tabindex="0"
	>
		<h3 class="text-foreground font-semibold">Opened {bag.name}{disambiguator}</h3>
		<h3 class="text-muted-foreground text-sm">{bag.roasterName}</h3>
		<div class="text-center flex justify-between gap-4 my-2">
			<div class="flex gap-2">
				<Calendar class="size-6 text-muted-foreground" />
				<p class="text-muted-foreground">Opened on</p>
				<p>{bag.dateOpened ? formatDate(bag.dateOpened) : 'N/A'}</p>
			</div>
		</div>
	</div>
</div>

<Dialog.Root bind:open={detailDialogOpen}>
	<Dialog.Content class="max-h-[90vh] overflow-y-auto">
		<Dialog.Header>
			<Dialog.Title class="flex items-center justify-center gap-2">
				<ClipboardList class="size-5 text-bold inline-block align-text-top" />
				Bag Opened			</Dialog.Title>
		</Dialog.Header>
		<BagDetail {bag} />
	</Dialog.Content>
</Dialog.Root>
