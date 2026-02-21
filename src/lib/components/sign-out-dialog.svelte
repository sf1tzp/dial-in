<script lang="ts">
    import * as Dialog from "$lib/components/ui/dialog";
    import { Button } from "$lib/components/ui/button";
    import { Loader2 } from "@lucide/svelte";

    interface Props {
        open: boolean;
        hasDirtyData: boolean;
        onconfirm: () => void;
        oncancel: () => void;
    }

    let { open = $bindable(), hasDirtyData, onconfirm, oncancel }: Props = $props();
    let syncing = $state(false);

    function handleConfirm() {
        syncing = true;
        onconfirm();
    }
</script>

<Dialog.Root bind:open>
    <Dialog.Content>
        <Dialog.Header>
            <Dialog.Title>Sign out</Dialog.Title>
            <Dialog.Description>
                Your data will stay on this device but won't be visible until you sign back in.
            </Dialog.Description>
        </Dialog.Header>
        {#if hasDirtyData}
            <div class="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 rounded-md border p-3 text-sm">
                <p>You have unsynced changes. They'll be synced before signing out.</p>
            </div>
        {/if}
        <Dialog.Footer>
            <Button variant="outline" onclick={oncancel} disabled={syncing}>
                Cancel
            </Button>
            <Button variant="destructive" onclick={handleConfirm} disabled={syncing}>
                {#if syncing}
                    <Loader2 class="mr-2 size-4 animate-spin" />
                    Syncing...
                {:else}
                    Sign out
                {/if}
            </Button>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>
