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
    import type { CoffeeBag, CoffeeBrew as CoffeeBrew } from '$lib/storage/interfaces';
    import { coffeeBagStore, coffeeBrewStore } from '$lib/storage';
    import { Button, buttonVariants } from "$lib/components/ui/button";
    import Coffee from "@lucide/svelte/icons/coffee";
    import ClipboardList from "@lucide/svelte/icons/clipboard-list";

    const coffeeBagFormData = defaults(zod4(coffeeBagSchema));
    const coffeeBrewFormData = defaults(zod4(coffeeBrewSchema));

    // Dialog open states
    let coffeeBagDialogOpen = $state(false);
    let coffeeBrewDialogOpen = $state(false);

    // Edit dialog states
    let editBagDialogOpen = $state(false);
    let editBrewDialogOpen = $state(false);
    let editingBag = $state<CoffeeBag | null>(null);
    let editingBrew = $state<CoffeeBrew | null>(null);

    // Delete confirmation dialog states
    let deleteBagDialogOpen = $state(false);
    let deleteBrewDialogOpen = $state(false);
    let deletingBag = $state<CoffeeBag | null>(null);
    let deletingBrew = $state<CoffeeBrew | null>(null);

    // Create form data for editing
    const editBagFormData = $derived(editingBag ? defaults({
        id: editingBag.id,
        name: editingBag.name,
        roasterName: editingBag.roasterName,
        style: editingBag.style || undefined,
        dateRoasted: editingBag.dateRoasted || undefined,
        dateOpened: editingBag.dateOpened || undefined,
        notes: editingBag.notes || undefined,
        picture: editingBag.picture,
    }, zod4(coffeeBagSchema)) : defaults(zod4(coffeeBagSchema)));

    const editBrewFormData = $derived(editingBrew ? defaults({
        id: editingBrew.id,
        coffeeBagId: editingBrew.coffeeBagId,
        grindSetting: editingBrew.grindSetting,
        dryWeight: editingBrew.dryWeight,
        brewTime: editingBrew.brewTime,
        pressureReading: editingBrew.pressureReading,
        notes: editingBrew.notes || undefined,
        picture: editingBrew.picture,
    }, zod4(coffeeBrewSchema)) : defaults(zod4(coffeeBrewSchema)));

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
        // Add is async but updates UI immediately, errors are handled internally
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
        // Add is async but updates UI immediately, errors are handled internally
        coffeeBrewStore.add(newShot);
        coffeeBrewDialogOpen = false;
    }

    // Edit handlers
    function handleEditBag(bag: CoffeeBag) {
        editingBag = bag;
        editBagDialogOpen = true;
    }

    function handleEditBrew(brew: CoffeeBrew) {
        editingBrew = brew;
        editBrewDialogOpen = true;
    }

    function handleEditBagSubmit(formData: CoffeeBagFormData) {
        if (!editingBag) return;
        coffeeBagStore.update(editingBag.id, {
            name: formData.name,
            roasterName: formData.roasterName,
            style: formData.style || '',
            dateRoasted: formData.dateRoasted || undefined,
            dateOpened: formData.dateOpened || undefined,
            notes: formData.notes || '',
            picture: formData.picture,
        });
        editBagDialogOpen = false;
        editingBag = null;
    }

    function handleEditBrewSubmit(formData: CoffeeBrewFormData) {
        if (!editingBrew) return;
        coffeeBrewStore.update(editingBrew.id, {
            coffeeBagId: formData.coffeeBagId,
            grindSetting: formData.grindSetting,
            dryWeight: formData.dryWeight,
            brewTime: formData.brewTime,
            pressureReading: formData.pressureReading,
            notes: formData.notes,
            picture: formData.picture,
        });
        editBrewDialogOpen = false;
        editingBrew = null;
    }

    // Delete handlers
    function handleDeleteBag(bag: CoffeeBag) {
        deletingBag = bag;
        deleteBagDialogOpen = true;
    }

    function handleDeleteBrew(brew: CoffeeBrew) {
        deletingBrew = brew;
        deleteBrewDialogOpen = true;
    }

    function confirmDeleteBag() {
        if (deletingBag) {
            coffeeBagStore.remove(deletingBag.id);
            deleteBagDialogOpen = false;
            deletingBag = null;
        }
    }

    function confirmDeleteBrew() {
        if (deletingBrew) {
            coffeeBrewStore.remove(deletingBrew.id);
            deleteBrewDialogOpen = false;
            deletingBrew = null;
        }
    }
</script>

<div class="mt-32 text-center">
    <Greeting showWelcomeMessage={coffeeBagStore.items.length === 0} />
</div>

<div class="mt-32 sm:mt-48 flex justify-around">
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
    <CoffeeTimeline
        entries={timelineEntries}
        onEditBag={handleEditBag}
        onDeleteBag={handleDeleteBag}
        onEditBrew={handleEditBrew}
        onDeleteBrew={handleDeleteBrew}
    />
</div>

<!-- Edit Bag Dialog -->
<Dialog.Root bind:open={editBagDialogOpen}>
    <Dialog.Content>
        <Dialog.Header>
            <Dialog.Title class="flex justify-center">
                <span class="mt-2">Edit Bag</span>
                <ClipboardList class="size-8 pt-1 pl-2"/>
            </Dialog.Title>
        </Dialog.Header>
        {#if editingBag}
            <CoffeeBagForm data={editBagFormData} onSubmit={handleEditBagSubmit} submitLabel="Update" />
        {/if}
    </Dialog.Content>
</Dialog.Root>

<!-- Edit Brew Dialog -->
<Dialog.Root bind:open={editBrewDialogOpen}>
    <Dialog.Content>
        <Dialog.Header>
            <Dialog.Title class="flex justify-center">
                <span class="mt-2">Edit Brew</span>
                <Coffee class="pl-2 size-8"/>
            </Dialog.Title>
        </Dialog.Header>
        {#if editingBrew}
            <CoffeeBrewForm data={editBrewFormData} coffeeBags={coffeeBagStore.items} onSubmit={handleEditBrewSubmit} submitLabel="Update" />
        {/if}
    </Dialog.Content>
</Dialog.Root>

<!-- Delete Bag Confirmation Dialog -->
<Dialog.Root bind:open={deleteBagDialogOpen}>
    <Dialog.Content>
        <Dialog.Header>
            <Dialog.Title>Delete Coffee Bag</Dialog.Title>
            <Dialog.Description>
                Are you sure you want to delete "{deletingBag?.name}"? This action cannot be undone.
            </Dialog.Description>
        </Dialog.Header>
        <Dialog.Footer>
            <Button variant="outline" onclick={() => { deleteBagDialogOpen = false; deletingBag = null; }}>
                Cancel
            </Button>
            <Button variant="destructive" onclick={confirmDeleteBag}>
                Delete
            </Button>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>

<!-- Delete Brew Confirmation Dialog -->
<Dialog.Root bind:open={deleteBrewDialogOpen}>
    <Dialog.Content>
        <Dialog.Header>
            <Dialog.Title>Delete Brew</Dialog.Title>
            <Dialog.Description>
                Are you sure you want to delete this brew? This action cannot be undone.
            </Dialog.Description>
        </Dialog.Header>
        <Dialog.Footer>
            <Button variant="outline" onclick={() => { deleteBrewDialogOpen = false; deletingBrew = null; }}>
                Cancel
            </Button>
            <Button variant="destructive" onclick={confirmDeleteBrew}>
                Delete
            </Button>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>

