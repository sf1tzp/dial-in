<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Loader2, ExternalLink, Check, Heart } from '@lucide/svelte';
	import { loadStripe, type StripeEmbeddedCheckout } from '@stripe/stripe-js';
	import { env } from '$env/dynamic/public';
	import { page } from '$app/state';
	import { onDestroy } from 'svelte';

	let loading = $state(true);
	let actionLoading = $state(false);
	let status = $state<string>('inactive');
	let currentPeriodEnd = $state<string | null>(null);
	let cancelAtPeriodEnd = $state(false);
	let subscribedSince = $state<string | null>(null);

	// Embedded checkout state
	let selectedPlan = $state<'monthly' | 'yearly' | null>(null);
	let checkoutMounting = $state(false);
	let checkoutInstance: StripeEmbeddedCheckout | null = null;

	const freeFeatures = [
		'Track your bags and brews',
		'Brew analytics and stats',
		'Data stored locally on-device',
	];

	const syncFeatures = [
		'Everything in Free',
		'Cloud backup and sync',
		'Access your brews from any device',
		'Photo uploads for bags and brews',
	];

	async function fetchStatus() {
		try {
			const res = await fetch('/api/billing/status');
			if (res.ok) {
				const data = await res.json();
				status = data.status;
				currentPeriodEnd = data.currentPeriodEnd;
				cancelAtPeriodEnd = data.cancelAtPeriodEnd;
				subscribedSince = data.subscribedSince;
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
		const isPostCheckout = page.url.searchParams.get('checkout') === 'success';

		if (isPostCheckout) {
			// Poll for status update — webhook may take a moment to arrive
			let attempts = 0;
			const poll = setInterval(async () => {
				attempts++;
				await fetchStatus();
				if (status === 'active' || attempts >= 10) {
					clearInterval(poll);
				}
			}, 2000);
			// Also fetch immediately
			fetchStatus();
			return () => clearInterval(poll);
		} else {
			fetchStatus();
		}
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

{#if loading}
	<div class="flex items-center justify-center py-32 text-muted-foreground">
		<Loader2 class="h-5 w-5 animate-spin" />
	</div>
{:else if status === 'active'}
	<section class="py-16 md:py-32">
		<div class="mx-auto max-w-md space-y-6 text-center">
			<Heart class="mx-auto size-10 text-primary" />
			<h1 class="text-3xl font-semibold">Thank you for subscribing!</h1>
			<p class="text-muted-foreground">
				Your brews are synced and backed up to the cloud.
			</p>

			<div class="rounded-(--radius) border p-6 text-left space-y-3">
				{#if subscribedSince}
					<div class="flex justify-between text-sm">
						<span class="text-muted-foreground">Subscribed since</span>
						<span class="font-medium">{formatDate(subscribedSince)}</span>
					</div>
				{/if}
				{#if currentPeriodEnd}
					<div class="flex justify-between text-sm">
						<span class="text-muted-foreground">
							{cancelAtPeriodEnd ? 'Access until' : 'Renews'}
						</span>
						<span class="font-medium">{formatDate(currentPeriodEnd)}</span>
					</div>
				{/if}
				{#if cancelAtPeriodEnd}
					<Badge variant="secondary">Cancels at period end</Badge>
				{/if}
			</div>

			<Button onclick={manageSubscription} disabled={actionLoading} variant="outline">
				{#if actionLoading}
					<Loader2 class="mr-2 h-4 w-4 animate-spin" />
				{/if}
				Manage Subscription
				<ExternalLink class="ml-2 h-4 w-4" />
			</Button>
		</div>
	</section>
{:else if status === 'past_due'}
	<section class="py-16 md:py-32">
		<div class="mx-auto max-w-md space-y-6 text-center">
			<h1 class="text-3xl font-semibold">Payment Issue</h1>
			<p class="text-muted-foreground">
				Your last payment failed. Please update your payment method to keep syncing.
			</p>
			<Button onclick={manageSubscription} disabled={actionLoading}>
				{#if actionLoading}
					<Loader2 class="mr-2 h-4 w-4 animate-spin" />
				{/if}
				Update Payment
				<ExternalLink class="ml-2 h-4 w-4" />
			</Button>
		</div>
	</section>
{:else if selectedPlan}
	<section class="py-16 md:py-32">
		<div class="mx-auto max-w-lg space-y-6">
			<div class="flex items-center justify-between">
				<h1 class="text-2xl font-semibold">
					Checkout — {selectedPlan === 'monthly' ? '$3 / month' : '$25 / year'}
				</h1>
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
	</section>
{:else}
	<section class="py-16 md:py-32">
		<div class="mx-auto max-w-5xl px-6">
			<div class="mx-auto max-w-2xl space-y-6 text-center">
				<h1 class="text-center text-4xl font-semibold lg:text-5xl">
					Keep your brews in sync
				</h1>
				<p class="text-muted-foreground">
					Dial-in is free to use on any device. Subscribe to sync your data across devices, back up to the cloud, and upload photos.
				</p>
			</div>

			<div class="mt-8 grid gap-6 md:mt-20 md:grid-cols-5 md:gap-0">
				<div
					class="rounded-(--radius) flex flex-col justify-between space-y-8 border p-6 md:col-span-2 md:my-2 md:rounded-r-none md:border-r-0 lg:p-10"
				>
					<div class="space-y-4">
						<div>
							<h2 class="font-medium">Free</h2>
							<span class="my-3 block text-2xl font-semibold">$0 / mo</span>
							<p class="text-muted-foreground text-sm">Single device</p>
						</div>

						<Button href="/" variant="outline" class="w-full">Current Plan</Button>

						<hr class="border-dashed" />

						<ul class="list-outside space-y-3 text-sm">
							{#each freeFeatures as item (item)}
								<li class="flex items-center gap-2">
									<Check class="size-3" />
									{item}
								</li>
							{/each}
						</ul>
					</div>
				</div>

				<div
					class="dark:bg-muted rounded-(--radius) border p-6 shadow-lg shadow-gray-950/5 md:col-span-3 lg:p-10 dark:[--color-muted:var(--color-zinc-900)]"
				>
					<div class="grid gap-6 sm:grid-cols-2">
						<div class="space-y-4">
							<div>
								<h2 class="font-medium">Sync</h2>
								<div class="my-3 space-y-1">
									<span class="block text-2xl font-semibold">$3 / mo</span>
									<span class="block text-sm text-muted-foreground">or $25 / year</span>
								</div>
								<p class="text-muted-foreground text-sm">All your devices</p>
							</div>

							<div class="flex flex-col gap-2">
								<Button class="w-full" onclick={() => subscribe('monthly')}>
									$3 / month
								</Button>
								<Button variant="outline" class="w-full" onclick={() => subscribe('yearly')}>
									$25 / year
								</Button>
							</div>
						</div>

						<div>
							<div class="text-sm font-medium">Everything in Free, plus:</div>

							<ul class="mt-4 list-outside space-y-3 text-sm">
								{#each syncFeatures as item (item)}
									<li class="flex items-center gap-2">
										<Check class="size-3" />
										{item}
									</li>
								{/each}
							</ul>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>
{/if}
