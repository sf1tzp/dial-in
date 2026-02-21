<script lang="ts">
    import * as Dialog from "$lib/components/ui/dialog";
    import { Button } from "$lib/components/ui/button";

    interface Props {
        open: boolean;
        bagCount: number;
        brewCount: number;
        onadopt: () => void;
        ondecline: () => void;
    }

    let { open = $bindable(), bagCount, brewCount, onadopt, ondecline }: Props = $props();
</script>

<Dialog.Root bind:open>
    <Dialog.Content>
        <Dialog.Header>
            <Dialog.Title>Adopt existing data?</Dialog.Title>
            <Dialog.Description>
                There {bagCount + brewCount === 1 ? 'is' : 'are'} {#if bagCount > 0}{bagCount} {bagCount === 1 ? 'bag' : 'bags'}{/if}{#if bagCount > 0 && brewCount > 0} and {/if}{#if brewCount > 0}{brewCount} {brewCount === 1 ? 'brew' : 'brews'}{/if} on this device that {bagCount + brewCount === 1 ? "isn't" : "aren't"} linked to any account. Would you like to add {bagCount + brewCount === 1 ? 'it' : 'them'} to yours?
            </Dialog.Description>
        </Dialog.Header>
        <Dialog.Footer>
            <Button variant="outline" onclick={ondecline}>
                No thanks
            </Button>
            <Button onclick={onadopt}>
                Adopt
            </Button>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>
