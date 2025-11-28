<script lang="ts">
	import { superForm, type SuperValidated } from 'sveltekit-superforms';
	import { zod4 } from 'sveltekit-superforms/adapters';
	import { espressoShotSchema, type EspressoShotFormData } from '$lib/schemas/coffee';
	import * as Field from '$lib/components/ui/field';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Button } from '$lib/components/ui/button';
	import type { CoffeeBag } from '$lib/storage/interfaces';

	interface Props {
		data: SuperValidated<EspressoShotFormData>;
		coffeeBags?: CoffeeBag[];
		onSubmit?: (data: EspressoShotFormData) => void;
		submitLabel?: string;
	}

	let { data, coffeeBags = [], onSubmit, submitLabel = 'Log Shot' }: Props = $props();

	const form = superForm(data, {
		validators: zod4(espressoShotSchema),
		SPA: true,
		onUpdate: ({ form }) => {
			if (form.valid && onSubmit) {
				onSubmit(form.data as EspressoShotFormData);
			}
		},
	});

	const { form: formData, errors, enhance } = form;
</script>

<form method="POST" enctype="multipart/form-data" use:enhance class="space-y-4">
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

	<div class="grid gap-4 sm:grid-cols-2">
		<Field.Field>
			<Field.Label for="grinderCoarseness">Grinder Setting</Field.Label>
			<Input
				id="grinderCoarseness"
				name="grinderCoarseness"
				type="number"
				step="0.1"
				min="0"
				max="100"
				placeholder="e.g., 15"
				bind:value={$formData.grinderCoarseness}
				aria-invalid={$errors.grinderCoarseness ? 'true' : undefined}
			/>
			<Field.Description>Coarseness setting (0-100)</Field.Description>
			<Field.Error>{$errors.grinderCoarseness}</Field.Error>
		</Field.Field>

		<Field.Field>
			<Field.Label for="grinderTime">Grind Time (seconds)</Field.Label>
			<Input
				id="grinderTime"
				name="grinderTime"
				type="number"
				step="0.1"
				min="0"
				placeholder="e.g., 12.5"
				bind:value={$formData.grinderTime}
				aria-invalid={$errors.grinderTime ? 'true' : undefined}
			/>
			<Field.Error>{$errors.grinderTime}</Field.Error>
		</Field.Field>
	</div>

	<div class="grid gap-4 sm:grid-cols-2">
		<Field.Field>
			<Field.Label for="dryWeight">Dose (grams)</Field.Label>
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
			<Field.Description>Dry coffee weight</Field.Description>
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
		<Field.Label for="pressureReading">Pressure (bar)</Field.Label>
		<Input
			id="pressureReading"
			name="pressureReading"
			type="number"
			step="0.1"
			min="0"
			max="15"
			placeholder="e.g., 9.0"
			bind:value={$formData.pressureReading}
			aria-invalid={$errors.pressureReading ? 'true' : undefined}
		/>
		<Field.Description>Average pressure during extraction</Field.Description>
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
		<Field.Description>Upload a photo of your shot</Field.Description>
	</Field.Field>

	<Button type="submit" class="w-full">
		{submitLabel}
	</Button>
</form>
