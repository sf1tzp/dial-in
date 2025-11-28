<script lang="ts">
    import CoffeeBagForm from "$lib/components/forms/CoffeeBagForm.svelte";
    import CoffeeBrewForm from "$lib/components/forms/CoffeeBrewForm.svelte";
    import CoffeeTimeline from "$lib/components/timeline/CoffeeTimeline.svelte";
    import { Greeting } from "$lib/components/greeting";
    import { uuidv7 } from "uuidv7";
    import * as Dialog from "$lib/components/ui/dialog";
    import { defaults } from 'sveltekit-superforms';
    import { zod4 } from 'sveltekit-superforms/adapters';
    import { coffeeBagSchema, coffeeBrewSchema as coffeeBrewSchema, type CoffeeBagFormData, type CoffeeBrewFormData as CoffeeBrewFormData } from '$lib/schemas/coffee';
    import ScrollArea from "$lib/components/ui/scroll-area/scroll-area.svelte";
    import type { CoffeeBag, CoffeeBrew as CoffeeBrew } from '$lib/storage/interfaces';
    import { coffeeBagStore, coffeeBrewStore } from '$lib/storage';
    import { buttonVariants } from "$lib/components/ui/button";
    import Coffee from "@lucide/svelte/icons/coffee";
    import ClipboardList from "@lucide/svelte/icons/clipboard-list";

    const coffeeBagFormData = defaults(zod4(coffeeBagSchema));
    const coffeeBrewFormData = defaults(zod4(coffeeBrewSchema));

    // Dialog open states
    let coffeeBagDialogOpen = $state(false);
    let coffeeBrewDialogOpen = $state(false);

    // Timeline entries derived from coffee bags and espresso shots
    const timelineEntries = $derived([
        ...coffeeBagStore.items.map((bag) => ({ type: 'coffee-bag' as const, data: bag })),
        ...coffeeBrewStore.items.map((shot) => ({
            type: 'coffee-brew' as const,
            data: shot,
            coffeeBag: coffeeBagStore.items.find((bag) => bag.id === shot.coffeeBagId),
        })),
    ]);

    function handleCoffeeBagSubmit(formData: CoffeeBagFormData) {
        const now = new Date();
        const newBag: CoffeeBag = {
            id: uuidv7(),
            name: formData.name,
            roasterName: formData.roasterName,
            style: formData.style || '',
            dateRoasted: formData.dateRoasted || undefined,
            dateOpened: formData.dateOpened || undefined,
            notes: formData.notes || '',
            picture: formData.picture,
            createdAt: now,
            updatedAt: now,
        };
        coffeeBagStore.add(newBag);
        coffeeBagDialogOpen = false;
    }

    function handleCoffeeBrewSubmit(formData: CoffeeBrewFormData) {
        const now = new Date();
        const newShot: CoffeeBrew = {
            id: uuidv7(),
            coffeeBagId: formData.coffeeBagId,
            grindSetting: formData.grindSetting,
            dryWeight: formData.dryWeight,
            brewTime: formData.brewTime,
            pressureReading: formData.pressureReading,
            notes: formData.notes,
            picture: formData.picture,
            createdAt: now,
            updatedAt: now,
        };
        coffeeBrewStore.add(newShot);
        coffeeBrewDialogOpen = false;
    }
</script>

<div class="pt-32 text-center">
    <Greeting />
</div>

<div class="mt-48 flex justify-around">
    <Dialog.Root bind:open={coffeeBagDialogOpen}>
        <Dialog.Trigger class={buttonVariants({ variant: "default" })}>
            <ClipboardList class="size-4"/>
            Open a Bag
        </Dialog.Trigger>
        <Dialog.Content>
            <Dialog.Header>
                <Dialog.Title class="flex justify-center">
                    <span class="mt-2 ">Open a Bag</span>
                    <ClipboardList class="size-8 pt-1 pl-2"/>
                </Dialog.Title>
            </Dialog.Header>
            <CoffeeBagForm data={coffeeBagFormData} onSubmit={handleCoffeeBagSubmit} />
        </Dialog.Content>
    </Dialog.Root>

    <Dialog.Root bind:open={coffeeBrewDialogOpen}>
        <Dialog.Trigger class={buttonVariants({ variant: "default" })} disabled={coffeeBagStore.items.length === 0}>
            <Coffee class="size-4"/>
            Start a Brew
        </Dialog.Trigger>
        <Dialog.Content>
            <Dialog.Header>
                <Dialog.Title class="flex justify-center">
                    <span class="mt-2">Start a Brew</span>
                    <Coffee class="pl-2 size-8"/>
                </Dialog.Title>
            </Dialog.Header>
                <CoffeeBrewForm data={coffeeBrewFormData} coffeeBags={coffeeBagStore.items} onSubmit={handleCoffeeBrewSubmit} />
        </Dialog.Content>
    </Dialog.Root>
</div>

<div class="mt-14">
    <CoffeeTimeline entries={timelineEntries} />
</div>

