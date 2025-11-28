<script lang="ts">
	import * as Card from '$lib/components/ui/card';
</script>

<svelte:head>
	<title>About | Dial-in</title>
</svelte:head>

<div class="mx-auto max-w-7xl p-4">
	<h1 class="text-3xl font-bold">About Dial-in</h1>

	<div class="mt-4 grid gap-4">
		<Card.Root>
			<Card.Header>
				<Card.Title>Refine Your Coffee Brew</Card.Title>
			</Card.Header>
			<Card.Content class="space-y-4">
				<p>
					Record your brewing parameters here.
				</p>
				<p>
					View the stats page to see trends.
				</p>
				<p>
					Adjust in pursuit of the perfect cup.
				</p>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header>
				<Card.Title>Getting Started</Card.Title>
			</Card.Header>
			<Card.Content class="space-y-4">
				<p>
					Start by adding a coffee bag to track. Then, each time you brew, log the details of your
					extraction. Over time, you'll build a library of brewing data that helps you understand
					what works best for different coffees.
				</p>
				<p>
					Start by adding a coffee bag to track. Then, each time you brew, log the details of your
					extraction. Over time, you'll build a library of brewing data that helps you understand
					what works best for different coffees.
				</p>
			</Card.Content>
		</Card.Root>
	</div>
</div>
