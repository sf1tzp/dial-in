<script lang="ts">
	import { superForm, type SuperValidated } from 'sveltekit-superforms';
	import { zod4 } from 'sveltekit-superforms/adapters';
	import { coffeeBagSchema, type CoffeeBagFormData } from '$lib/schemas/coffee';
	import * as Field from '$lib/components/ui/field';
	import * as Carousel from '$lib/components/ui/carousel';
	import type { CarouselAPI } from '$lib/components/ui/carousel/context';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Button } from '$lib/components/ui/button';
	import { DateInput } from '$lib/components/ui/date-input';
	import CameraIcon from '@lucide/svelte/icons/camera';
    import ChevronRight from '@lucide/svelte/icons/chevron-right';
    import ChevronLeft from '@lucide/svelte/icons/chevron-left';

	interface Props {
		data: SuperValidated<CoffeeBagFormData>;
		onSubmit?: (data: CoffeeBagFormData) => void;
		submitLabel?: string;
	}

	let { data, onSubmit, submitLabel = 'Save' }: Props = $props();

	const form = superForm(data, {
		validators: zod4(coffeeBagSchema),
		SPA: true,
		onUpdate: ({ form }) => {
			if (form.valid && onSubmit) {
				onSubmit(form.data as CoffeeBagFormData);
			}
		},
	});

	const { form: formData, errors, enhance } = form;

	// Default dateOpened to today if not set
	$effect(() => {
		if ($formData.dateOpened === undefined) {
			$formData.dateOpened = new Date();
		}
	});

	let api = $state<CarouselAPI>();
	let currentSlide = $state(0);

	$effect(() => {
		if (api) {
			currentSlide = api.selectedScrollSnap();
			api.on('select', () => {
				currentSlide = api!.selectedScrollSnap();
			});
		}
	});

	function goToDetails() {
		api?.scrollNext();
	}

	function goBack() {
		api?.scrollPrev();
	}
</script>

<form method="POST" enctype="multipart/form-data" use:enhance>
	<Carousel.Root
		setApi={(emblaApi) => (api = emblaApi)}
		opts={{ watchDrag: false }}
		class="w-full"
	>
		<Carousel.Content>
			<!-- Slide 1: Essential Fields -->
			<Carousel.Item>
				<div class="space-y-4 px-1">
					<!-- Name and Picture on same row -->
					<div class="flex items-start">
						<Field.Field class="w-2/3">
							<Field.Label for="name">Coffee</Field.Label>
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

						<Field.Field class="w-1/3 flex-1 flex-col items-center">
							<Field.Label for="picture" class="sr-only">Picture</Field.Label>
							<label
								for="picture"
								class="mt-4 flex h-16 w-16 cursor-pointer flex-col items-center justify-center"
							>
								<CameraIcon class="size-6" />
								<span class="mt-0.5 text-[10px] text-muted-foreground">Add Picture</span>
							</label>
							<Input
								id="picture"
								name="picture"
								type="file"
								accept="image/*"
								class="hidden"
								onchange={(e) => {
									const file = e.currentTarget.files?.[0];
									if (file) {
										$formData.picture = file;
									}
								}}
							/>
						</Field.Field>
					</div>

					<!-- Roaster full width -->
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

					<div class="grid gap-4 grid-cols-2">
						<Field.Field>
							<DateInput
								id="dateRoasted"
								value={$formData.dateRoasted}
								placeholder="Roasted On"
								label="Roasted:"
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
						<DateInput
							id="dateOpened"
							value={$formData.dateOpened}
							placeholder="Unknown"
							label="Opened:"
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

				<Button
					variant="ghost"
					onclick={goToDetails}
					class="w-full"
				>
					<p class="text-muted-foreground">Add Details</p>
					<ChevronRight/>
				</Button>
				</div>
			</Carousel.Item>

			<!-- Slide 2: Detail Fields -->
			<Carousel.Item>
				<div class="flex flex-col flex-1 space-y-4 px-1">
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

					<Field.Field class="flex flex-col flex-1">
						<Field.Label for="notes">Notes</Field.Label>
						<Textarea
							id="notes"
							name="notes"
							placeholder="Tasting notes, brewing tips, etc."
							bind:value={$formData.notes}
							aria-invalid={$errors.notes ? 'true' : undefined}
							class="flex-1 min-h-[120px] resize-none"
						/>
						<Field.Error>{$errors.notes}</Field.Error>
					</Field.Field>
				</div>
					<Button
						variant="ghost"
						onclick={goBack}
						class="w-full"
					>
						<ChevronLeft/>
						<p class="text-muted-foreground">Go Back</p>
					</Button>

			</Carousel.Item>
		</Carousel.Content>
	</Carousel.Root>
	<Button type="submit" class="mt-4 w-full">
		{submitLabel}
	</Button>
</form>
