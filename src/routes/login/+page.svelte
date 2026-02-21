<script lang="ts">
    import { authClient } from '$lib/auth-client';
    import { goto } from '$app/navigation';
    import { Button } from '$lib/components/ui/button';

    let email = $state('');
    let sent = $state(false);
    let loading = $state(false);
    let error = $state('');

    const session = authClient.useSession();

    // Redirect if already signed in
    $effect(() => {
        if ($session.data?.user) {
            goto('/');
        }
    });

    async function handleSubmit(e: SubmitEvent) {
        e.preventDefault();
        loading = true;
        error = '';

        const { error: err } = await authClient.signIn.magicLink({ email });
        loading = false;

        if (err) {
            error = err.message || 'Something went wrong. Please try again.';
        } else {
            sent = true;
        }
    }
</script>

<div class="mx-auto flex min-h-[60vh] max-w-sm flex-col items-center justify-center px-4">
    {#if sent}
        <div class="text-center">
            <h1 class="text-2xl font-semibold">Check your email</h1>
            <p class="text-muted-foreground mt-2">
                We sent a sign-in link to <strong>{email}</strong>.
            </p>
            <button
                class="text-muted-foreground mt-4 text-sm underline"
                onclick={() => { sent = false; }}
            >
                Use a different email
            </button>
        </div>
    {:else}
        <h1 class="text-2xl font-semibold">Sign in</h1>
        <p class="text-muted-foreground mt-1 text-center text-sm">
            Enter your email to receive a sign-in link.
        </p>

        <form onsubmit={handleSubmit} class="mt-6 w-full space-y-4">
            <input
                type="email"
                bind:value={email}
                placeholder="you@example.com"
                required
                class="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
            />
            {#if error}
                <p class="text-destructive text-sm">{error}</p>
            {/if}
            <Button type="submit" class="w-full" disabled={loading}>
                {loading ? 'Sending...' : 'Send sign-in link'}
            </Button>
        </form>
    {/if}
</div>
