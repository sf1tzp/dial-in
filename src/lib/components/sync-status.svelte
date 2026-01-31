<script lang="ts">
	import { syncService } from '$lib/storage';
	import CloudIcon from '@lucide/svelte/icons/cloud';
	import CloudOffIcon from '@lucide/svelte/icons/cloud-off';
	import RefreshCwIcon from '@lucide/svelte/icons/refresh-cw';
	import AlertCircleIcon from '@lucide/svelte/icons/alert-circle';
	import CheckCircleIcon from '@lucide/svelte/icons/check-circle';

	const status = $derived(syncService.status);

	function formatLastSync(date: Date | null): string {
		if (!date) return 'Never synced';

		const now = new Date();
		const diff = now.getTime() - date.getTime();
		const minutes = Math.floor(diff / 60000);

		if (minutes < 1) return 'Just now';
		if (minutes < 60) return `${minutes}m ago`;

		const hours = Math.floor(minutes / 60);
		if (hours < 24) return `${hours}h ago`;

		return date.toLocaleDateString();
	}

	async function handleManualSync() {
		try {
			await syncService.syncNow();
		} catch (error) {
			console.error('Manual sync failed:', error);
		}
	}
</script>

<div class="flex items-center gap-2 text-sm text-muted-foreground">
	{#if status.isSyncing}
		<RefreshCwIcon class="size-4 animate-spin" />
		<span>Syncing...</span>
	{:else if status.lastError}
		<button
			onclick={handleManualSync}
			class="flex items-center gap-2 hover:text-destructive transition-colors"
			title={status.lastError}
		>
			<AlertCircleIcon class="size-4 text-destructive" />
			<span>Sync error</span>
		</button>
	{:else if status.lastSyncTime}
		<span>Last Sync</span>
		<button
			onclick={handleManualSync}
			class="flex items-center gap-2 hover:text-foreground transition-colors"
			title="Click to sync now"
		>
			<CheckCircleIcon class="size-4 text-green-500" />
			<span>{formatLastSync(status.lastSyncTime)}</span>
		</button>
	{:else}
		<button
			onclick={handleManualSync}
			class="flex items-center gap-2 hover:text-foreground transition-colors"
			title="Click to sync"
		>
			<CloudOffIcon class="size-4" />
			<span>Not synced</span>
		</button>
	{/if}
</div>
