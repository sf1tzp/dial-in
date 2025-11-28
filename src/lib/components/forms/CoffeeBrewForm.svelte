<script lang="ts">
	import { superForm, type SuperValidated } from 'sveltekit-superforms';
	import { zod4 } from 'sveltekit-superforms/adapters';
	import { coffeeBrewSchema, type CoffeeBrewFormData } from '$lib/schemas/coffee';
	import * as Field from '$lib/components/ui/field';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Button } from '$lib/components/ui/button';
	import { Slider } from '$lib/components/ui/slider';
	import type { CoffeeBag } from '$lib/storage/interfaces';
    import { GRINDER_MAX, PRESSURE_MAX, PRESSURE_UNIT, USE_PRESSURE_UNIT } from '$lib/settings';
    import ScrollArea from '../ui/scroll-area/scroll-area.svelte';

	interface Props {
		data: SuperValidated<CoffeeBrewFormData>;
		coffeeBags?: CoffeeBag[];
		onSubmit?: (data: CoffeeBrewFormData) => void;
		submitLabel?: string;
	}

	let { data, coffeeBags = [], onSubmit, submitLabel = 'Save' }: Props = $props();

	const form = superForm(data, {
		validators: zod4(coffeeBrewSchema),
		SPA: true,
		onUpdate: ({ form }) => {
			if (form.valid && onSubmit) {
				onSubmit(form.data as CoffeeBrewFormData);
			}
		},
	});

	const { form: formData, errors, enhance } = form;

	// Preselect the most recently added coffee bag (first in the array)
	$effect(() => {
		if (!$formData.coffeeBagId && coffeeBags.length > 0) {
			$formData.coffeeBagId = coffeeBags[0].id;
		}
	});
</script>

<form method="POST" enctype="multipart/form-data" use:enhance class="space-y-4">
	<ScrollArea class="h-100">
	<Field.Field>
		<Field.Label for="coffeeBagId">Coffee Bag</Field.Label>
		<select
			id="coffeeBagId"
			name="coffeeBagId"
			bind:value={$formData.coffeeBagId}
			class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 shadow-xs flex h-9 w-full rounded-md border px-3 py-1 text-base outline-none transition-[color,box-shadow] focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30"
			aria-invalid={$errors.coffeeBagId ? 'true' : undefined}
		>
			<option value="">Select a coffee bag</option>
			{#each coffeeBags as bag}
				<option value={bag.id}>{bag.name} - {bag.roasterName}</option>
			{/each}
		</select>
		<Field.Error>{$errors.coffeeBagId}</Field.Error>
	</Field.Field>

		<Field.Field>
			<Field.Label for="grinderCoarseness">
				Grinder Setting: {($formData.grindSetting ?? (0.5 * GRINDER_MAX)).toFixed(1)}
			</Field.Label>
			<Slider
				type="single"
				id="grinderCoarseness"
				min={0}
				max={GRINDER_MAX}
				step={0.1}
				value={$formData.grindSetting ?? (0.5 * GRINDER_MAX)}
				onValueChange={(v) => ($formData.grindSetting = v)}
			/>
			<Field.Description>Coarseness setting (0-{GRINDER_MAX})</Field.Description>
			<Field.Error>{$errors.grindSetting}</Field.Error>
		</Field.Field>

	<div class="grid gap-4 sm:grid-cols-2">
		<Field.Field>
			<Field.Label for="dryWeight">Dry Weight (grams)</Field.Label>
			<Input
				id="dryWeight"
				name="dryWeight"
				type="number"
				step="0.1"
				min="0"
				placeholder="e.g., 18.0"
				bind:value={$formData.dryWeight}
				aria-invalid={$errors.dryWeight ? 'true' : undefined}
			/>
			<!-- <Field.Description>Dry coffee weight</Field.Description> -->
			<Field.Error>{$errors.dryWeight}</Field.Error>
		</Field.Field>

		<Field.Field>
			<Field.Label for="brewTime">Brew Time (seconds)</Field.Label>
			<Input
				id="brewTime"
				name="brewTime"
				type="number"
				step="0.1"
				min="0"
				placeholder="e.g., 28"
				bind:value={$formData.brewTime}
				aria-invalid={$errors.brewTime ? 'true' : undefined}
			/>
			<Field.Error>{$errors.brewTime}</Field.Error>
		</Field.Field>
	</div>

	<Field.Field>
		<Field.Label for="pressureReading">Pressure: {$formData.pressureReading ?? (USE_PRESSURE_UNIT ? 0.5 * PRESSURE_MAX : 50)} {USE_PRESSURE_UNIT ? PRESSURE_UNIT : '%'}</Field.Label>
		<Slider
			type="single"
			id="pressureReading"
			min={0}
			max={USE_PRESSURE_UNIT ? PRESSURE_MAX : 100}
			step={1}
			value={$formData.pressureReading ?? (USE_PRESSURE_UNIT ? 0.5 * PRESSURE_MAX : 50)}
			onValueChange={(v) => ($formData.pressureReading = v)}
		/>
		<Field.Description>Pressure level { USE_PRESSURE_UNIT ? `(0-${PRESSURE_MAX} bar)` : '(0-100%)'}</Field.Description>
		<Field.Error>{$errors.pressureReading}</Field.Error>
	</Field.Field>

	<Field.Field>
		<Field.Label for="notes">Notes (optional)</Field.Label>
		<Textarea
			id="notes"
			name="notes"
			placeholder="Taste notes, adjustments to make, etc."
			bind:value={$formData.notes}
			aria-invalid={$errors.notes ? 'true' : undefined}
		/>
		<Field.Error>{$errors.notes}</Field.Error>
	</Field.Field>

	<Field.Field>
		<Field.Label for="picture">Picture (optional)</Field.Label>
		<Input
			id="picture"
			name="picture"
			type="file"
			accept="image/*"
			onchange={(e) => {
				const file = e.currentTarget.files?.[0];
				if (file) {
					$formData.picture = file;
				}
			}}
		/>
		<!-- <Field.Description>Upload a photo of your shot</Field.Description> -->
	</Field.Field>
	</ScrollArea>

	<Button type="submit" class="w-full">
		{submitLabel}
	</Button>
</form>
