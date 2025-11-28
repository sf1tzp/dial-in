<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import underExtractedImg from '$lib/assets/under-extracted.png';
	import idealExtractedImg from '$lib/assets/ideal-extracted.png';
	import overExtractedImg from '$lib/assets/over-extracted.png';
</script>

<svelte:head>
	<title>About | Dial-in</title>
</svelte:head>

<h1 class="text-3xl font-bold">Dial-In Your Espresso</h1>

<Card.Root class="mt-4">
	<Card.Content class="space-y-6">
		<div class="space-y-4">
			<h2 class="text-lg font-semibold">Coffee Grind and Puck Density</h2>
			<p>
				When preparing an espresso shot, three variables determine the density of the coffee puck:
			</p>
			<ul class="list-disc list-inside space-y-1">
				<li>The coarseness of the grind</li>
				<li>The amount of coffee in the portafilter (Dry Weight)</li>
				<li>The tamping pressure (how firmly the coffee is compressed)</li>
			</ul>
			<p>
				Many tamps are spring-loaded to apply consistent pressure, removing that variable from the equation. This leaves grind size and coffee dose under the brewer's control.
			</p>
			<p>
				The goal is to achieve a puck density that maintains ideal pressure during extraction, resulting in a balanced, flavorful shot.
			</p>
		</div>
		<div class="space-y-4">
			<h2 class="text-lg font-semibold">The Pressure Gauge</h2>
			<div class="grid gap-4 md:grid-cols-3">
				<div class="rounded-lg border p-3 text-center">
					<img src={underExtractedImg} alt="Under-extracted pressure gauge" class="mx-auto mb-2 h-24 w-auto" />
					<p class="font-medium text-yellow-600">Under-Extracted Zone</p>
					<p class="text-sm text-muted-foreground">
						Needle in lower zone indicates insufficient pressure extraction. Light and pale crema.
					</p>
				</div>
				<div class="rounded-lg border p-3 text-center bg-muted/50">
					<img src={idealExtractedImg} alt="Ideal extraction pressure gauge" class="mx-auto mb-2 h-24 w-auto" />
					<p class="font-medium text-green-600">Ideal Espresso Zone</p>
					<p class="text-sm text-muted-foreground">
						Needle in solid gray zone indicates extraction at ideal pressure.
					</p>
				</div>
				<div class="rounded-lg border p-3 text-center">
					<img src={overExtractedImg} alt="Over-extracted pressure gauge" class="mx-auto mb-2 h-24 w-auto" />
					<p class="font-medium text-red-600">Over-Extracted Zone</p>
					<p class="text-sm text-muted-foreground">
						Needle in upper zone indicates too much pressure. Very dark, uneven crema.
					</p>
				</div>
			</div>
		</div>

		<div class="space-y-4">
			<h2 class="text-lg font-semibold">Optimal Parameters</h2>
			<div class="rounded-lg border p-3 bg-muted/50">
				<div class="grid grid-cols-4 gap-2 text-center text-sm font-medium">
					<div>Grind</div>
					<div>Dry Weight</div>
					<div>Tamp Pressure</div>
					<div>Shot Time</div>
				</div>
				<div class="grid grid-cols-4 gap-2 text-center text-sm text-muted-foreground">
					<div>Varies</div>
					<div>13-17g</div>
					<div>9-15 kg</div>
					<div>25-45 sec</div>
				</div>
			</div>
		</div>

		<div class="space-y-4">
			<h2 class="text-lg font-semibold">Troubleshooting Parameters</h2>
			<div class="-ml-2">
				<table class="w-full text-sm">
					<thead>
						<tr class="border-b">
							<th class="p-2 text-left"></th>
							<th class="p-2 text-left">Grind Setting</th>
							<th class="p-2 text-left">Dry Weight</th>
							<th class="p-2 text-left">Tamp Pressure</th>
							<th class="p-2 text-left">Shot Time</th>
						</tr>
					</thead>
					<tbody>
						<tr class="border-b">
							<td class="p-2 font-medium text-red-600">Over Extracted</td>
							<td class="p-2">Too Fine</td>
							<td class="p-2">Too Much</td>
							<td class="p-2">Too Heavy</td>
							<td class="p-2">&gt; 50 sec</td>
						</tr>
						<tr class="border-b">
							<td class="p-2 font-medium text-yellow-600">Under Extracted</td>
							<td class="p-2">Too Coarse</td>
							<td class="p-2">Too Little</td>
							<td class="p-2">Too Light</td>
							<td class="p-2">&lt; 20 sec</td>
						</tr>
					</tbody>
				</table>
			</div>
			<p class="text-sm text-muted-foreground italic">
				<strong>Tip:</strong> After adjusting your grinder settings, discard the first few grams of ground coffee before dosing. The grinder retains grounds from the previous setting, which can lead to inconsistent results.
			</p>
		</div>
	</Card.Content>
</Card.Root>
