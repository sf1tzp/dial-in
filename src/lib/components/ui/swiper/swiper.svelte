<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import Pencil from '@lucide/svelte/icons/pencil';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		ondelete?: () => void;
		onedit?: () => void;
		children?: Snippet;
	}

	let {
		ondelete,
		onedit,
		children,
		class: className = '',
		...restProps
	}: Props = $props();

	let swiperRef: HTMLDivElement | undefined = $state();

	// Scroll to center on mount to hide actions
	$effect(() => {
		if (swiperRef) {
			const centerChild = swiperRef.children[1] as HTMLElement;
			if (centerChild) {
				requestAnimationFrame(() => {
					swiperRef!.scrollLeft = centerChild.offsetLeft;
				});
			}
		}
	});
</script>

<div
	bind:this={swiperRef}
	class="swiper {className}"
	{...restProps}
>
	{#if ondelete}
		<button
			class="swiper-action delete"
			onclick={ondelete}
		>
			<Trash2 />
		</button>
	{:else}
		<div class="swiper-placeholder"></div>
	{/if}

	<div class="swiper-content">
		{#if children}
			{@render children()}
		{/if}
	</div>

	{#if onedit}
		<button
			class="swiper-action edit"
			onclick={onedit}
		>
			<Pencil />
		</button>
	{:else}
		<div class="swiper-placeholder"></div>
	{/if}
</div>

<style>
	.swiper {
		display: grid;
		grid-template-columns: auto 1fr auto;
		overflow-x: auto;
		overflow-y: hidden;
		scroll-snap-type: x mandatory;
		container-type: inline-size;
		scrollbar-width: none;
	}

	.swiper::-webkit-scrollbar {
		display: none;
	}

	.swiper-content {
		width: 100cqw;
		scroll-snap-align: center;
		scroll-snap-stop: always;
	}

	.swiper > .swiper-action:first-child,
	.swiper > .swiper-placeholder:first-child {
		scroll-snap-align: start;
	}

	.swiper > .swiper-action:last-child,
	.swiper > .swiper-placeholder:last-child {
		scroll-snap-align: end;
	}

	.swiper-action {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		min-width: 80px;
		padding: 0.5rem 1rem;
		cursor: pointer;
		color: white;
		font-size: 1rem;
		position: relative;
	}

	.swiper-action::before {
		content: '';
		position: absolute;
		top: 0;
		bottom: 0;
		width: 100vw;
		background: inherit;
	}

	.swiper-action.delete::before {
		right: 100%;
	}

	.swiper-action.edit::before {
		left: 100%;
	}

	.swiper-action.delete {
		background: var(--color-destructive, #ef4444);
	}

	.swiper-action.edit {
		background: var(--color-edit, #22c55e);
	}

	.swiper-placeholder {
		width: 0;
	}
</style>
