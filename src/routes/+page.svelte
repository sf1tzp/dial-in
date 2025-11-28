<script lang="ts">
    import CoffeeBagForm from "$lib/components/forms/CoffeeBagForm.svelte";
    import EspressoShotForm from "$lib/components/forms/EspressoShotForm.svelte";
    import Button from "$lib/components/ui/button/button.svelte";
    import { VList } from "virtua/svelte";
    import { defaults } from 'sveltekit-superforms';
    import { zod4 } from 'sveltekit-superforms/adapters';
    import { coffeeBagSchema, espressoShotSchema } from '$lib/schemas/coffee';

    type FormType = 'none' | 'coffee' | 'shot';
    let activeForm: FormType = $state('none');

    function toggleForm(form: 'coffee' | 'shot') {
        activeForm = activeForm === form ? 'none' : form;
    }

    const coffeeBagFormData = defaults(zod4(coffeeBagSchema));
    const espressoShotFormData = defaults(zod4(espressoShotSchema));
</script>

<h1>Dial In</h1>

<div>
    <h2>Add entry</h2>
    <Button onclick={() => toggleForm('coffee')}>Coffee</Button>
    <Button onclick={() => toggleForm('shot')}>Shot</Button>
</div>

{#if activeForm === 'coffee'}
    <div>
        <h3>Add Coffee Bag</h3>
        <CoffeeBagForm data={coffeeBagFormData} />
    </div>
{:else if activeForm === 'shot'}
    <div>
        <h3>Log Espresso Shot</h3>
        <EspressoShotForm data={espressoShotFormData} />
    </div>
{/if}

<div>
    <p>Timeline Placeholder</p>
</div>

