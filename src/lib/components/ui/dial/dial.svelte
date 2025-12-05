<script lang="ts">
	import { cn } from "$lib/utils.js";

	interface Props {
		value?: number;
		min?: number;
		max?: number;
		step?: number;
		onValueChange?: (value: number) => void;
		class?: string;
		size?: number;
		showLabels?: boolean;
		unit?: string;
	}

	let {
		value = $bindable(50),
		min = 0,
		max = 100,
		step = 1,
		onValueChange,
		class: className,
		size = 200,
		showLabels = true,
		unit = '%'
	}: Props = $props();

    let colors = {

    }

	// Calculate needle rotation angle
	// Gauge spans from -135deg (min) to +135deg (max), total 270deg arc
	const minAngle = -135;
	const maxAngle = 135;
	const angleRange = maxAngle - minAngle;

	let needleAngle = $derived(() => {
		const normalized = (value - min) / (max - min);
		return minAngle + normalized * angleRange;
	});

	// Generate tick marks
	const majorTicks = 5; // Number of major divisions
	const minorTicksPerMajor = 4; // Minor ticks between major ones

	let majorTickMarks = $derived(() => {
		const ticks = [];
		for (let i = 0; i <= majorTicks; i++) {
			const tickValue = min + (i / majorTicks) * (max - min);
			const normalized = i / majorTicks;
			const angle = minAngle + normalized * angleRange;
			ticks.push({ angle, value: tickValue });
		}
		return ticks;
	});

	let minorTickMarks = $derived(() => {
		const ticks = [];
		const totalMinorTicks = majorTicks * minorTicksPerMajor;
		for (let i = 0; i <= totalMinorTicks; i++) {
			// Skip positions where major ticks are
			if (i % minorTicksPerMajor === 0) continue;
			const normalized = i / totalMinorTicks;
			const angle = minAngle + normalized * angleRange;
			ticks.push({ angle });
		}
		return ticks;
	});

	// Handle click/drag on the gauge
	let isDragging = $state(false);
	let gaugeElement: HTMLDivElement;

	function getValueFromEvent(e: MouseEvent | TouchEvent) {
		if (!gaugeElement) return;

		const rect = gaugeElement.getBoundingClientRect();
		const centerX = rect.left + rect.width / 2;
		const centerY = rect.top + rect.height * 0.8; // Center matches needle pivot point

		const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
		const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

		const dx = clientX - centerX;
		const dy = clientY - centerY;

		// Calculate angle from center (0 = up, clockwise positive)
		let angle = Math.atan2(dx, -dy) * (180 / Math.PI);

		// Clamp angle to gauge range
		angle = Math.max(minAngle, Math.min(maxAngle, angle));

		// Convert angle to value
		const normalized = (angle - minAngle) / angleRange;
		let newValue = min + normalized * (max - min);

		// Snap to step
		newValue = Math.round(newValue / step) * step;
		newValue = Math.max(min, Math.min(max, newValue));

		value = newValue;
		onValueChange?.(newValue);
	}

	function handleMouseDown(e: MouseEvent) {
		isDragging = true;
		getValueFromEvent(e);
	}

	function handleMouseMove(e: MouseEvent) {
		if (isDragging) {
			getValueFromEvent(e);
		}
	}

	function handleMouseUp() {
		isDragging = false;
	}

	function handleTouchStart(e: TouchEvent) {
		isDragging = true;
		getValueFromEvent(e);
	}

	function handleTouchMove(e: TouchEvent) {
		if (isDragging) {
			e.preventDefault();
			getValueFromEvent(e);
		}
	}

	function handleTouchEnd() {
		isDragging = false;
	}

</script>

<svelte:window
	onmousemove={handleMouseMove}
	onmouseup={handleMouseUp}
	ontouchend={handleTouchEnd}
/>

<div
	class={cn("relative inline-flex flex-col items-center select-none", className)}
	style="width: {size}px;"
>
	<!-- Gauge Container -->
	<div
		bind:this={gaugeElement}
		class="relative cursor-pointer"
		style="width: {size}px; height: {size * 0.65}px;"
		role="slider"
		tabindex="0"
		aria-valuenow={value}
		aria-valuemin={min}
		aria-valuemax={max}
		onmousedown={handleMouseDown}
		ontouchstart={handleTouchStart}
		ontouchmove={handleTouchMove}
	>
		<!-- SVG Gauge (Lucide gauge icon style) -->
		<svg
			viewBox="0 0 24 24"
			class="w-full h-full overflow-visible"
			fill="none"
			stroke-linecap="round"
			stroke-linejoin="round"
		>
			<!-- Gauge background arc (from Lucide gauge icon) -->
			<path
				d="M3.34 19a10 10 0 1 1 17.32 0"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				class="text-muted"
			/>

			<!-- Needle (rotating pill) -->
			<g transform="rotate({needleAngle()} 12 19)">
				<rect
					x="5"
					y="5"
					width="2"
					height="4"
					rx="1"
					class="fill-destructive"
				/>
			</g>
		</svg>
	</div>

	<!-- Digital readout -->
	<div class="mt-2 rounded-md bg-muted px-4 py-2 font-mono text-xl font-bold tabular-nums">
		{value.toFixed(step < 1 ? 1 : 0)}<span class="ml-1 text-sm text-muted-foreground">{unit}</span>
	</div>
</div>