<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface SwiperAction {
		color?: string;
		icon?: Snippet;
		label?: string;
		onclick?: () => void;
	}

	interface Props extends HTMLAttributes<HTMLDivElement> {
		hold?: boolean;
		left?: SwiperAction;
		right?: SwiperAction;
		children?: Snippet;
	}

	let {
		hold = false,
		left,
		right,
		children,
		class: className = '',
		...restProps
	}: Props = $props();

	let swiperRef: HTMLDivElement | undefined = $state();

	// For hold variant, scroll to center on mount
	$effect(() => {
		if (hold && swiperRef) {
			const centerChild = swiperRef.children[1] as HTMLElement;
			if (centerChild) {
				requestAnimationFrame(() => {
					swiperRef!.scrollLeft = centerChild.offsetLeft;
				});
			}
		}
	});

	function handleScroll(e: Event) {
		const scrollDiv = e.currentTarget as HTMLDivElement;
		const scrollCenter = scrollDiv.scrollWidth / 2;
		const viewportCenter = scrollDiv.clientWidth / 2;
		const current = scrollDiv.scrollLeft + viewportCenter;
		const dx = current - scrollCenter;

		// Detect if fully swiped to trigger action
		const threshold = 50;
		const maxScroll = scrollDiv.scrollWidth - scrollDiv.clientWidth;

		if (scrollDiv.scrollLeft <= threshold && left?.onclick) {
			// Swiped to reveal left action (scrolled to start)
		} else if (scrollDiv.scrollLeft >= maxScroll - threshold && right?.onclick) {
			// Swiped to reveal right action (scrolled to end)
		}
	}

	function handleLeftClick() {
		left?.onclick?.();
	}

	function handleRightClick() {
		right?.onclick?.();
	}
</script>

<div
	bind:this={swiperRef}
	class="swiper {hold ? 'hold' : ''} {className}"
	onscroll={handleScroll}
	{...restProps}
>
	{#if left}
		<button
			class="swiper-action left"
			style:background={left.color}
			onclick={handleLeftClick}
		>
			{#if left.icon}
				{@render left.icon()}
			{/if}
			{#if left.label}
				<span class="swiper-label">{left.label}</span>
			{/if}
		</button>
	{:else}
		<div class="swiper-placeholder"></div>
	{/if}

	<div class="swiper-content">
		{#if children}
			{@render children()}
		{/if}
	</div>

	{#if right}
		<button
			class="swiper-action right"
			style:background={right.color}
			onclick={handleRightClick}
		>
			{#if right.icon}
				{@render right.icon()}
			{/if}
			{#if right.label}
				<span class="swiper-label">{right.label}</span>
			{/if}
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
	}

	.swiper.hold {
		> .swiper-action:first-child,
		> .swiper-placeholder:first-child {
			scroll-snap-align: start;
		}

		> .swiper-action:last-child,
		> .swiper-placeholder:last-child {
			scroll-snap-align: end;
		}
	}

	.swiper-action {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		min-width: 80px;
		padding: 0.5rem 1rem;
		border: none;
		cursor: pointer;
		color: white;
		font-size: 1rem;
	}

	.swiper-action.left {
		border-radius: 0;
	}

	.swiper-action.right {
		border-radius: 0;
	}

	.swiper-placeholder {
		width: 0;
	}

	.swiper-label {
		font-weight: 500;
	}
</style>
