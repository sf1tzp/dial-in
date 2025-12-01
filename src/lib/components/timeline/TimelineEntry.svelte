<script lang="ts">
	import type { Snippet } from 'svelte';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import Pencil from '@lucide/svelte/icons/pencil';
	import { Swiper } from '$lib/components/ui/swiper';
    import { Button } from '../ui/button';

	interface Props {
		ondelete?: () => void;
		onedit?: () => void;
		children?: Snippet;
		class?: string;
	}

	let {
		ondelete,
		onedit,
		children,
		class: className = '',
	}: Props = $props();
</script>

<!-- Mobile: Swiper-based interaction -->
<div class="block md:hidden">
	<Swiper {ondelete} {onedit} class="bg-card border-border rounded-lg border shadow-sm transition-shadow hover:shadow-md {className}">
		{#if children}
			{@render children()}
		{/if}
	</Swiper>
</div>

<!-- Desktop: Grid layout with action buttons on the right -->
<div class="hidden md:block max-w-4xl mx-auto">
<div class="md:grid md:grid-cols-[1fr_auto] bg-card border-border rounded-lg border shadow-sm transition-shadow hover:shadow-md {className}">
	{#if children}
		{@render children()}
	{/if}

	{#if onedit || ondelete}
		<div class="flex flex-col justify-start gap-2 p-3 text-muted-foreground">
			{#if ondelete}
				<Button
                    variant="destructive"
					onclick={ondelete}
					aria-label="Delete"
				>
					<Trash2 class="size-4" />
				</Button>
			{/if}
			{#if onedit}
				<Button
                    variant="outline"
					onclick={onedit}
					aria-label="Edit"
				>
					<Pencil class="size-4" />
				</Button>
			{/if}
		</div>
	{/if}
</div>
</div>
