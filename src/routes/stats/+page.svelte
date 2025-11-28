<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { GradientChart, type TimeSeriesDataPoint, type TimeSeriesConfig } from '$lib/components/ui/gradient-chart';
	import { coffeeBagStore, coffeeBrewStore } from '$lib/storage';
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
		{ key: 'brewTime', label: 'Brew Time (s):', color: 'var(--chart-2)' },
		{ key: 'dryWeight', label: 'Dry Weight (g):', color: 'var(--chart-3)' },
		{ key: 'pressureReading', label: 'Pressure Reading (%):', color: 'var(--chart-4)' },
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
		<Card.Header class="flex flex-row justify-between">
			<Card.Title class="sm:my-2">Brewing Insights</Card.Title>
			<Select.Root type="single" bind:value={selectedBagId}>
				<Select.Trigger id="bag-select">
					{coffeeBagStore.items.find(bag => bag.id === selectedBagId)?.name ?? 'Select a bag'}
				</Select.Trigger>
				<Select.Content>
					{#each coffeeBagStore.items as bag (bag.id)}
						<Select.Item value={bag.id} label={bag.name} />
					{/each}
					{#if coffeeBagStore.items.length === 0}
						<Select.Item value="none" label="No bags available" disabled />
					{/if}
				</Select.Content>
			</Select.Root>
		</Card.Header>
		<Card.Content>
			<GradientChart data={brewChartData} series={brewSeries} />
		</Card.Content>
	</Card.Root>
	{/if}
</div>
