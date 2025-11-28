<script lang="ts">
    import CoffeeBagForm from "$lib/components/forms/CoffeeBagForm.svelte";
    import CoffeeBrewForm from "$lib/components/forms/CoffeeBrewForm.svelte";
    import CoffeeTimeline from "$lib/components/timeline/CoffeeTimeline.svelte";
    import { uuidv7 } from "uuidv7";
    import * as Dialog from "$lib/components/ui/dialog";
    import { defaults } from 'sveltekit-superforms';
    import { zod4 } from 'sveltekit-superforms/adapters';
    import { coffeeBagSchema, coffeeBrewSchema as coffeeBrewSchema, type CoffeeBagFormData, type CoffeeBrewFormData as CoffeeBrewFormData } from '$lib/schemas/coffee';
    import ScrollArea from "$lib/components/ui/scroll-area/scroll-area.svelte";
    import type { CoffeeBag, CoffeeBrew as CoffeeBrew } from '$lib/storage/interfaces';
    import { testCoffeeBag, testCoffeeBrews } from '$lib/test-data';
    import { buttonVariants } from "$lib/components/ui/button";
    import Coffee from "@lucide/svelte/icons/coffee";
    import ClipboardList from "@lucide/svelte/icons/clipboard-list";

    const coffeeBagFormData = defaults(zod4(coffeeBagSchema));
    const coffeeBrewFormData = defaults(zod4(coffeeBrewSchema));

    // State for storing entries
    let coffeeBags = $state<CoffeeBag[]>([testCoffeeBag]);
    let coffeeBrews = $state<CoffeeBrew[]>([...testCoffeeBrews]);
    // let coffeeBags = $state<CoffeeBag[]>([]);
    // let coffeeBrews = $state<CoffeeBrew[]>([]);

    // Dialog open states
    let coffeeBagDialogOpen = $state(false);
    let coffeeBrewDialogOpen = $state(false);

    // Timeline entries derived from coffee bags and espresso shots
    const timelineEntries = $derived([
        ...coffeeBags.map((bag) => ({ type: 'coffee-bag' as const, data: bag })),
        ...coffeeBrews.map((shot) => ({
            type: 'coffee-brew' as const,
            data: shot,
            coffeeBag: coffeeBags.find((bag) => bag.id === shot.coffeeBagId),
        })),
    ]);

    function handleCoffeeBagSubmit(formData: CoffeeBagFormData) {
        const now = new Date();
        const newBag: CoffeeBag = {
            id: uuidv7(),
            name: formData.name,
            roasterName: formData.roasterName,
            style: formData.style,
            dateRoasted: formData.dateRoasted,
            dateOpened: formData.dateOpened,
            notes: formData.notes || '',
            picture: formData.picture,
            createdAt: now,
            updatedAt: now,
        };
        coffeeBags = [newBag, ...coffeeBags];
        coffeeBagDialogOpen = false;
    }

    function handleCoffeeBrewSubmit(formData: CoffeeBrewFormData) {
        const now = new Date();
        const newShot: CoffeeBrew = {
            id: uuidv7(),
            coffeeBagId: formData.coffeeBagId,
            grinderCoarseness: formData.grinderCoarseness,
            grinderTime: formData.grinderTime,
            dryWeight: formData.dryWeight,
            brewTime: formData.brewTime,
            pressureReading: formData.pressureReading,
            notes: formData.notes,
            picture: formData.picture,
            createdAt: now,
            updatedAt: now,
        };
        coffeeBrews = [newShot, ...coffeeBrews];
        coffeeBrewDialogOpen = false;
    }
</script>

<div class="pt-8 text-center">
    <h1 class="text-4xl">Greetings Component Placeholder</h1>
</div>

<div class="mt-8 flex justify-around">
    <Dialog.Root bind:open={coffeeBagDialogOpen}>
        <Dialog.Trigger class={buttonVariants({ variant: "default" })}>
            <ClipboardList class="size-4"/>
            Open a Bag
        </Dialog.Trigger>
        <Dialog.Content>
            <Dialog.Header>
                <Dialog.Title>Add Coffee Bag</Dialog.Title>
            </Dialog.Header>
            <ScrollArea class="h-100">
                <CoffeeBagForm data={coffeeBagFormData} onSubmit={handleCoffeeBagSubmit} />
            </ScrollArea>
        </Dialog.Content>
    </Dialog.Root>

    <Dialog.Root bind:open={coffeeBrewDialogOpen}>
        <Dialog.Trigger class={buttonVariants({ variant: "default" })}>
            <Coffee class="size-4"/>
            Start a Brew
        </Dialog.Trigger>
        <Dialog.Content>
            <Dialog.Header>
                <Dialog.Title>Log Coffee Brew</Dialog.Title>
            </Dialog.Header>
            <ScrollArea class="h-120">
                <CoffeeBrewForm data={coffeeBrewFormData} coffeeBags={coffeeBags} onSubmit={handleCoffeeBrewSubmit} />
            </ScrollArea>
        </Dialog.Content>
    </Dialog.Root>
</div>

<div class="mt-8">
    <CoffeeTimeline entries={timelineEntries} />
</div>

