<script lang="ts">
	import { superForm, type SuperValidated } from 'sveltekit-superforms';
	import { zod4 } from 'sveltekit-superforms/adapters';
	import { coffeeBagSchema, type CoffeeBagFormData } from '$lib/schemas/coffee';
	import * as Field from '$lib/components/ui/field';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Button } from '$lib/components/ui/button';
  	import { DateInput } from '$lib/components/ui/date-input';

	interface Props {
		data: SuperValidated<CoffeeBagFormData>;
		onSubmit?: (data: CoffeeBagFormData) => void;
		submitLabel?: string;
	}

	let { data, onSubmit, submitLabel = 'Save Coffee' }: Props = $props();

	const form = superForm(data, {
		validators: zod4(coffeeBagSchema),
		onResult: ({ result }) => {
			if (result.type === 'success' && onSubmit) {
				onSubmit($formData as CoffeeBagFormData);
			}
		},
	});

	const { form: formData, errors, enhance } = form;

	// Format date for input[type="date"]
	function formatDateForInput(date: Date | undefined): string {
		if (!date) return '';
		return date.toISOString().split('T')[0];
	}

	// Parse date from input[type="date"]
	function parseDateFromInput(value: string): Date | undefined {
		if (!value) return undefined;
		return new Date(value);
	}
</script>

<form method="POST" use:enhance class="space-y-4">
	<Field.Field>
		<Field.Label for="name">Coffee Name</Field.Label>
		<Input
			id="name"
			name="name"
			type="text"
			placeholder="Enter coffee name"
			bind:value={$formData.name}
			aria-invalid={$errors.name ? 'true' : undefined}
		/>
		<Field.Error>{$errors.name}</Field.Error>
	</Field.Field>

	<Field.Field>
		<Field.Label for="roasterName">Roaster</Field.Label>
		<Input
			id="roasterName"
			name="roasterName"
			type="text"
			placeholder="Enter roaster name"
			bind:value={$formData.roasterName}
			aria-invalid={$errors.roasterName ? 'true' : undefined}
		/>
		<Field.Error>{$errors.roasterName}</Field.Error>
	</Field.Field>

	<Field.Field>
		<Field.Label for="style">Style</Field.Label>
		<Input
			id="style"
			name="style"
			type="text"
			placeholder="e.g., Single Origin, Blend, Espresso"
			bind:value={$formData.style}
			aria-invalid={$errors.style ? 'true' : undefined}
		/>
		<Field.Error>{$errors.style}</Field.Error>
	</Field.Field>

	<div class="grid gap-4 sm:grid-cols-2">
		<Field.Field>
			<Field.Label for="dateRoasted">Date Roasted</Field.Label>
			<DateInput
				id="dateRoasted"
				value={$formData.dateRoasted}
				placeholder="Roasted On"
				onchange={(date) => {
					if (date) {
						$formData.dateRoasted = date;
					}
				}}
				aria-invalid={$errors.dateRoasted ? 'true' : undefined}
			/>
			<Field.Error>{$errors.dateRoasted}</Field.Error>
		</Field.Field>

		<Field.Field>
			<Field.Label for="dateOpened">Date Opened</Field.Label>
			<DateInput
				id="dateOpened"
				value={$formData.dateOpened}
				placeholder="Opened On"
				onchange={(date) => {
					if (date) {
						$formData.dateOpened = date;
					}
				}}
				aria-invalid={$errors.dateOpened ? 'true' : undefined}
			/>
			<Field.Error>{$errors.dateOpened}</Field.Error>
		</Field.Field>
	</div>

	<Field.Field>
		<Field.Label for="notes">Notes</Field.Label>
		<Textarea
			id="notes"
			name="notes"
			placeholder="Tasting notes, brewing tips, etc."
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
		<Field.Description>Upload an image of the coffee bag</Field.Description>
	</Field.Field>

	<Button type="submit" class="mt-4 w-full">
		{submitLabel}
	</Button>
</form>
