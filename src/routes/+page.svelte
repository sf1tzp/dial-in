<script lang="ts">
    import CoffeeBagForm from "$lib/components/forms/CoffeeBagForm.svelte";
    import EspressoShotForm from "$lib/components/forms/EspressoShotForm.svelte";
    import Button from "$lib/components/ui/button/button.svelte";
    import * as Dialog from "$lib/components/ui/dialog";
    import { defaults } from 'sveltekit-superforms';
    import { zod4 } from 'sveltekit-superforms/adapters';
    import { coffeeBagSchema, espressoShotSchema } from '$lib/schemas/coffee';
    import ScrollArea from "$lib/components/ui/scroll-area/scroll-area.svelte";

    const coffeeBagFormData = defaults(zod4(coffeeBagSchema));
    const espressoShotFormData = defaults(zod4(espressoShotSchema));
</script>

<h1>Dial In</h1>

<div>
    <h2>Add entry</h2>
    <Dialog.Root>
        <Dialog.Trigger>
            Coffee
        </Dialog.Trigger>
        <Dialog.Content>
            <Dialog.Header>
                <Dialog.Title>Add Coffee Bag</Dialog.Title>
            </Dialog.Header>
            <ScrollArea class="h-100">
                <CoffeeBagForm data={coffeeBagFormData} />
            </ScrollArea>
        </Dialog.Content>
    </Dialog.Root>

    <Dialog.Root>
        <Dialog.Trigger>
            Shot
        </Dialog.Trigger>
        <Dialog.Content>
            <Dialog.Header>
                <Dialog.Title>Log Espresso Shot</Dialog.Title>
            </Dialog.Header>
            <ScrollArea class="h-100">
                <EspressoShotForm data={espressoShotFormData} />
            </ScrollArea>
        </Dialog.Content>
    </Dialog.Root>
</div>

<div>
    <p>Timeline Placeholder</p>
</div>

