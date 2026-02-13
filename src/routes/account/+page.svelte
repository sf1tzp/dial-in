<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { CreditCard, ExternalLink, Loader2, Cloud, Smartphone, Image } from '@lucide/svelte';
	import { loadStripe, type StripeEmbeddedCheckout } from '@stripe/stripe-js';
	import { env } from '$env/dynamic/public';
	import { onDestroy } from 'svelte';

	let loading = $state(true);
	let actionLoading = $state(false);
	let status = $state<string>('inactive');
	let currentPeriodEnd = $state<string | null>(null);
	let cancelAtPeriodEnd = $state(false);

	// Embedded checkout state
	let selectedPlan = $state<'monthly' | 'yearly' | null>(null);
	let checkoutMounting = $state(false);
	let checkoutInstance: StripeEmbeddedCheckout | null = null;

	async function fetchStatus() {
		try {
			const res = await fetch('/api/billing/status');
			if (res.ok) {
				const data = await res.json();
				status = data.status;
				currentPeriodEnd = data.currentPeriodEnd;
				cancelAtPeriodEnd = data.cancelAtPeriodEnd;
			}
		} finally {
			loading = false;
		}
	}

	async function subscribe(plan: 'monthly' | 'yearly') {
		if (checkoutMounting) return;
		selectedPlan = plan;
		checkoutMounting = true;

		try {
			// Clean up any existing checkout
			if (checkoutInstance) {
				checkoutInstance.destroy();
				checkoutInstance = null;
			}

			const res = await fetch('/api/billing/checkout', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ plan }),
			});
			const data = await res.json();

			if (!data.clientSecret) {
				console.error('No client secret returned');
				selectedPlan = null;
				return;
			}

			const stripe = await loadStripe(env.PUBLIC_STRIPE_PUBLISHABLE_KEY!);
			if (!stripe) {
				console.error('Failed to load Stripe');
				selectedPlan = null;
				return;
			}

			checkoutInstance = await stripe.initEmbeddedCheckout({
				clientSecret: data.clientSecret,
			});

			// Wait for the DOM element to be available
			await new Promise((resolve) => setTimeout(resolve, 0));
			const el = document.getElementById('checkout-mount');
			if (el) {
				checkoutInstance.mount(el);
			}
		} catch (err) {
			console.error('Checkout error:', err);
			selectedPlan = null;
		} finally {
			checkoutMounting = false;
		}
	}

	function cancelCheckout() {
		if (checkoutInstance) {
			checkoutInstance.destroy();
			checkoutInstance = null;
		}
		selectedPlan = null;
	}

	async function manageSubscription() {
		actionLoading = true;
		try {
			const res = await fetch('/api/billing/portal', { method: 'POST' });
			const data = await res.json();
			if (data.url) {
				window.location.href = data.url;
			}
		} finally {
			actionLoading = false;
		}
	}

	function formatDate(iso: string): string {
		return new Date(iso).toLocaleDateString(undefined, {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		});
	}

	$effect(() => {
		fetchStatus();
	});

	onDestroy(() => {
		if (checkoutInstance) {
			checkoutInstance.destroy();
		}
	});
</script>

<svelte:head>
	<title>Account | Dial-in</title>
</svelte:head>

<h1 class="text-3xl font-bold">Account</h1>

<Card.Root class="mt-4 max-w-lg">
	<Card.Header>
		<Card.Title class="flex items-center gap-2">
			<CreditCard class="h-5 w-5" />
			Subscription
		</Card.Title>
	</Card.Header>
	<Card.Content>
		{#if loading}
			<div class="flex items-center gap-2 text-muted-foreground">
				<Loader2 class="h-4 w-4 animate-spin" />
				Loading...
			</div>
		{:else if status === 'active'}
			<div class="space-y-3">
				<div class="flex items-center gap-2">
					<Badge variant="default">Active</Badge>
					{#if cancelAtPeriodEnd}
						<span class="text-sm text-muted-foreground">Cancels at period end</span>
					{/if}
				</div>
				{#if currentPeriodEnd}
					<p class="text-sm text-muted-foreground">
						{cancelAtPeriodEnd ? 'Access until' : 'Renews'} {formatDate(currentPeriodEnd)}
					</p>
				{/if}
				<Button onclick={manageSubscription} disabled={actionLoading} variant="outline">
					{#if actionLoading}
						<Loader2 class="mr-2 h-4 w-4 animate-spin" />
					{/if}
					Manage Subscription
					<ExternalLink class="ml-2 h-4 w-4" />
				</Button>
			</div>
		{:else if status === 'past_due'}
			<div class="space-y-3">
				<Badge variant="destructive">Past Due</Badge>
				<p class="text-sm text-muted-foreground">
					Your payment failed. Please update your payment method.
				</p>
				<Button onclick={manageSubscription} disabled={actionLoading} variant="outline">
					{#if actionLoading}
						<Loader2 class="mr-2 h-4 w-4 animate-spin" />
					{/if}
					Update Payment
					<ExternalLink class="ml-2 h-4 w-4" />
				</Button>
			</div>
		{:else if selectedPlan}
			<div class="space-y-3">
				<div class="flex items-center justify-between">
					<span class="text-sm font-medium">
						{selectedPlan === 'monthly' ? '$3 / month' : '$25 / year'}
					</span>
					<Button variant="ghost" size="sm" onclick={cancelCheckout}>
						Cancel
					</Button>
				</div>
				{#if checkoutMounting}
					<div class="flex items-center gap-2 text-muted-foreground py-8 justify-center">
						<Loader2 class="h-4 w-4 animate-spin" />
						Loading checkout...
					</div>
				{/if}
				<div id="checkout-mount"></div>
			</div>
		{:else}
			<div class="space-y-4">
				<Badge variant="secondary">
					{status === 'canceled' ? 'Canceled' : 'Free'}
				</Badge>
				<ul class="space-y-2 text-sm text-muted-foreground">
					<li class="flex items-center gap-2">
						<Cloud class="h-4 w-4 shrink-0" />
						Cloud backup — your data is safe even if you clear your browser
					</li>
					<li class="flex items-center gap-2">
						<Smartphone class="h-4 w-4 shrink-0" />
						Cross-device sync — access your brews from any device
					</li>
					<li class="flex items-center gap-2">
						<Image class="h-4 w-4 shrink-0" />
						Photo uploads — attach pictures to your bags and brews
					</li>
				</ul>
				<div class="flex gap-2">
					<Button onclick={() => subscribe('monthly')} disabled={checkoutMounting}>
						$3 / month
					</Button>
					<Button onclick={() => subscribe('yearly')} disabled={checkoutMounting} variant="outline">
						$25 / year
					</Button>
				</div>
			</div>
		{/if}
	</Card.Content>
</Card.Root>
