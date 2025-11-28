<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { GradientChart, type TimeSeriesDataPoint, type TimeSeriesConfig } from '$lib/components/ui/gradient-chart';
	import { coffeeBagStore, coffeeBrewStore } from '$lib/storage';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import CoffeeIcon from '@lucide/svelte/icons/coffee';

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
		{ key: 'brewTime', label: 'Brew Time (s):', color: 'var(--chart-2)' },
		{ key: 'dryWeight', label: 'Dry Weight (g):', color: 'var(--chart-3)' },
	];
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
		<div class="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
		<Card.Root>
			<Card.Header>
				<Card.Title>Total Brews</Card.Title>
				<Card.Description>All time brewing sessions</Card.Description>
			</Card.Header>
			<Card.Content>
				<p class="text-4xl font-bold">{coffeeBrewStore.items.length}</p>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header>
				<Card.Title>Coffee Bags</Card.Title>
				<Card.Description>Bags tracked</Card.Description>
			</Card.Header>
			<Card.Content>
				<p class="text-4xl font-bold">{coffeeBagStore.items.length}</p>
			</Card.Content>
		</Card.Root>
	</div>

	<Card.Root class="mt-4">
		<Card.Header class="flex flex-row items-center justify-between space-y-0">
			<div>
				<Card.Title>Brewing Insights</Card.Title>
				<Card.Description>Your coffee journey at a glance</Card.Description>
			</div>
			<div class="relative">
				<select
					bind:value={selectedBagId}
					class="border-input bg-background ring-offset-background focus:ring-ring h-9 appearance-none rounded-md border py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2"
				>
					{#each coffeeBagStore.items as bag (bag.id)}
						<option value={bag.id}>{bag.name}</option>
					{/each}
					{#if coffeeBagStore.items.length === 0}
						<option value="none">No bags available</option>
					{/if}
				</select>
				<ChevronDownIcon class="text-muted-foreground pointer-events-none absolute right-2 top-1/2 size-4 -translate-y-1/2" />
			</div>
		</Card.Header>
		<Card.Content>
			<GradientChart data={brewChartData} series={brewSeries} />
		</Card.Content>
	</Card.Root>
	{/if}
</div>
