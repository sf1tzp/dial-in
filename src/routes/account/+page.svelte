<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { CreditCard, ExternalLink, Loader2 } from '@lucide/svelte';

	let loading = $state(true);
	let actionLoading = $state(false);
	let status = $state<string>('inactive');
	let currentPeriodEnd = $state<string | null>(null);
	let cancelAtPeriodEnd = $state(false);

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

	async function subscribe() {
		actionLoading = true;
		try {
			const res = await fetch('/api/billing/checkout', { method: 'POST' });
			const data = await res.json();
			if (data.url) {
				window.location.href = data.url;
			}
		} finally {
			actionLoading = false;
		}
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
		{:else}
			<div class="space-y-3">
				<Badge variant="secondary">
					{status === 'canceled' ? 'Canceled' : 'Free'}
				</Badge>
				<p class="text-sm text-muted-foreground">
					Subscribe to access all features.
				</p>
				<Button onclick={subscribe} disabled={actionLoading}>
					{#if actionLoading}
						<Loader2 class="mr-2 h-4 w-4 animate-spin" />
					{/if}
					Subscribe — $1/mo
				</Button>
			</div>
		{/if}
	</Card.Content>
</Card.Root>
