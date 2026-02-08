<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { GradientChart, type TimeSeriesDataPoint, type TimeSeriesConfig } from '$lib/components/ui/gradient-chart';
	import { coffeeBagStore, coffeeBrewStore } from '$lib/storage';
	import { formatBagLabel } from '$lib/bags';
	import CoffeeIcon from '@lucide/svelte/icons/coffee';
	import * as Select from '$lib/components/ui/select';

	const hasData = $derived(coffeeBagStore.items.length > 0 || coffeeBrewStore.items.length > 0);

	let selectedBagId = $state<string>(coffeeBagStore.items[0]?.id ?? 'none');

	// Filter brews based on selected bag
	const filteredBrews = $derived(
			coffeeBrewStore.items.filter(brew => brew.coffeeBagId === selectedBagId)
	);

	// Transform CoffeeBrew data into chart-compatible format
	const brewChartData: TimeSeriesDataPoint[] = $derived(filteredBrews.map(brew => ({
		date: brew.createdAt,
		grinderCoarseness: brew.grindSetting,
		brewTime: brew.brewTime,
		pressureReading: brew.pressureReading,
		dryWeight: brew.dryWeight,
	})));

	// Define which series to display
	const brewSeries: TimeSeriesConfig[] = [
		{ key: 'grinderCoarseness', label: 'Grind Setting:', color: 'var(--chart-1)' },
		// { key: 'brewTime', label: 'Brew Time (s):', color: 'var(--chart-2)' },
		{ key: 'dryWeight', label: 'Dry Weight (g):', color: 'var(--chart-3)' },
		{ key: 'pressureReading', label: 'Pressure Reading (%):', color: 'var(--chart-4)' },
	];

	// Calculate insights for selected bag
	const brewCount = $derived(filteredBrews.length);
	const avgPressure = $derived(
		brewCount > 0
			? (filteredBrews.reduce((sum, b) => sum + (b.pressureReading ?? 0), 0) / brewCount).toFixed(1)
			: '—'
	);
	const avgDryWeight = $derived(
		brewCount > 0
			? (filteredBrews.reduce((sum, b) => sum + (b.dryWeight ?? 0), 0) / brewCount).toFixed(1)
			: '—'
	);
	const avgGrindSetting = $derived(
		brewCount > 0
			? (filteredBrews.reduce((sum, b) => sum + (b.grindSetting ?? 0), 0) / brewCount).toFixed(1)
			: '—'
	);
</script>

<svelte:head>
	<title>Stats | Dial-in</title>
</svelte:head>

<div class="mx-auto max-w-7xl p-4">
	<h1 class="text-3xl font-bold">Stats</h1>

	{#if !hasData}
		<Card.Root class="mt-8 text-center">
			<Card.Header>
				<div class="mx-auto mb-2">
					<CoffeeIcon class="text-muted-foreground size-12" />
				</div>
				<Card.Title>No Data Yet</Card.Title>
				<Card.Description>
					Start tracking your coffee journey by adding your first bag and brew.
				</Card.Description>
			</Card.Header>
			<Card.Content>
				<Button href="/">Go to Home</Button>
			</Card.Content>
		</Card.Root>
	{:else}
		<Card.Root class="mt-4">
			<Card.Content class="grid grid-cols-2 gap-4">
				<div>
					<p class="text-muted-foreground text-sm">Total Brews</p>
					<p class="text-3xl font-bold">{coffeeBrewStore.items.length}</p>
				</div>
				<div>
					<p class="text-muted-foreground text-sm">Coffee Bags</p>
					<p class="text-3xl font-bold">{coffeeBagStore.items.length}</p>
				</div>
			</Card.Content>
		</Card.Root>

	<Card.Root class="mt-4">
		<Card.Header class="flex flex-row justify-between">
			<Card.Title class="sm:my-2">Brewing Insights</Card.Title>
			<Select.Root type="single" bind:value={selectedBagId}>
				<Select.Trigger id="bag-select">
					{(() => { const bag = coffeeBagStore.items.find(b => b.id === selectedBagId); return bag ? formatBagLabel(bag, coffeeBagStore.items) : 'Select a bag'; })()}
				</Select.Trigger>
				<Select.Content>
					{#each coffeeBagStore.items as bag (bag.id)}
						<Select.Item value={bag.id} label={formatBagLabel(bag, coffeeBagStore.items)} />
					{/each}
					{#if coffeeBagStore.items.length === 0}
						<Select.Item value="none" label="No bags available" disabled />
					{/if}
				</Select.Content>
			</Select.Root>
		</Card.Header>
		<Card.Content>
			<div class="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
				<div>
					<p class="text-muted-foreground text-sm"># of Brews</p>
					<p class="text-2xl font-bold">{brewCount}</p>
				</div>
				<div>
					<p class="text-muted-foreground text-sm">Avg Pressure</p>
					<p class="text-2xl font-bold">{avgPressure}{avgPressure !== '—' ? '%' : ''}</p>
				</div>
				<div>
					<p class="text-muted-foreground text-sm">Avg Dry Weight</p>
					<p class="text-2xl font-bold">{avgDryWeight}{avgDryWeight !== '—' ? 'g' : ''}</p>
				</div>
				<div>
					<p class="text-muted-foreground text-sm">Avg Grind Setting</p>
					<p class="text-2xl font-bold">{avgGrindSetting}</p>
				</div>
			</div>
			<GradientChart data={brewChartData} series={brewSeries} />
		</Card.Content>
	</Card.Root>
	{/if}
</div>
