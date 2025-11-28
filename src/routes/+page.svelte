<script lang="ts">
    import CoffeeBagForm from "$lib/components/forms/CoffeeBagForm.svelte";
    import EspressoShotForm from "$lib/components/forms/EspressoShotForm.svelte";
    import CoffeeTimeline from "$lib/components/timeline/CoffeeTimeline.svelte";
    import { uuidv7 } from "uuidv7";
    import * as Dialog from "$lib/components/ui/dialog";
    import { defaults } from 'sveltekit-superforms';
    import { zod4 } from 'sveltekit-superforms/adapters';
    import { coffeeBagSchema, espressoShotSchema, type CoffeeBagFormData, type EspressoShotFormData } from '$lib/schemas/coffee';
    import ScrollArea from "$lib/components/ui/scroll-area/scroll-area.svelte";
    import type { CoffeeBag, EspressoShot } from '$lib/storage/interfaces';

    const coffeeBagFormData = defaults(zod4(coffeeBagSchema));
    const espressoShotFormData = defaults(zod4(espressoShotSchema));

    // State for storing entries
    const testCoffeeBag: CoffeeBag = {
        id: 'test-bag-1',
        name: 'Ethiopian Yirgacheffe',
        roasterName: 'Counter Culture',
        style: 'Single Origin',
        dateRoasted: new Date('2025-11-20'),
        dateOpened: new Date('2025-11-25'),
        notes: 'Bright and fruity with blueberry notes',
        createdAt: new Date('2025-11-25T10:30:00'),
        updatedAt: new Date('2025-11-25T10:30:00'),
    };

    const testEspressoShot: EspressoShot = {
        id: 'test-shot-1',
        coffeeBagId: 'test-bag-1',
        grinderCoarseness: 12,
        grinderTime: 8.5,
        dryWeight: 18,
        brewTime: 28,
        pressureReading: 9,
        notes: 'Slightly under-extracted, try finer grind',
        createdAt: new Date('2025-11-27T08:15:00'),
        updatedAt: new Date('2025-11-27T08:15:00'),
    };

    let coffeeBags = $state<CoffeeBag[]>([testCoffeeBag]);
    let espressoShots = $state<EspressoShot[]>([testEspressoShot]);

    // Dialog open states
    let coffeeBagDialogOpen = $state(false);
    let espressoShotDialogOpen = $state(false);

    // Timeline entries derived from coffee bags and espresso shots
    const timelineEntries = $derived([
        ...coffeeBags.map((bag) => ({ type: 'coffee-bag' as const, data: bag })),
        ...espressoShots.map((shot) => ({
            type: 'espresso-shot' as const,
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

    function handleEspressoShotSubmit(formData: EspressoShotFormData) {
        const now = new Date();
        const newShot: EspressoShot = {
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
        espressoShots = [newShot, ...espressoShots];
        espressoShotDialogOpen = false;
    }
</script>

<h1>Dial In</h1>

<div>
    <h2>Add entry</h2>
    <Dialog.Root bind:open={coffeeBagDialogOpen}>
        <Dialog.Trigger>
            Coffee
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

    <Dialog.Root bind:open={espressoShotDialogOpen}>
        <Dialog.Trigger>
            Shot
        </Dialog.Trigger>
        <Dialog.Content>
            <Dialog.Header>
                <Dialog.Title>Log Espresso Shot</Dialog.Title>
            </Dialog.Header>
            <ScrollArea class="h-100">
                <EspressoShotForm data={espressoShotFormData} coffeeBags={coffeeBags} onSubmit={handleEspressoShotSubmit} />
            </ScrollArea>
        </Dialog.Content>
    </Dialog.Root>
</div>

<div>
    <CoffeeTimeline entries={timelineEntries} />
</div>

