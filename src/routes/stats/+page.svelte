<script lang="ts">
	import * as Card from '$lib/components/ui/card';
  import { GradientChart } from '$lib/components/ui/gradient-chart';
</script>

<svelte:head>
	<title>Stats | Dial-in</title>
</svelte:head>

<div class="mx-auto max-w-7xl p-4">
	<h1 class="text-3xl font-bold">Stats</h1>

	<div class="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
		<Card.Root>
			<Card.Header>
				<Card.Title>Total Brews</Card.Title>
				<Card.Description>All time brewing sessions</Card.Description>
			</Card.Header>
			<Card.Content>
				<p class="text-4xl font-bold">0</p>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header>
				<Card.Title>Coffee Bags</Card.Title>
				<Card.Description>Bags tracked</Card.Description>
			</Card.Header>
			<Card.Content>
				<p class="text-4xl font-bold">0</p>
			</Card.Content>
		</Card.Root>
	</div>

	<Card.Root class="mt-4">
		<Card.Header>
			<Card.Title>Brewing Insights</Card.Title>
			<Card.Description>Your coffee journey at a glance</Card.Description>
		</Card.Header>
		<Card.Content>
			<GradientChart />
		</Card.Content>
	</Card.Root>


</div>
