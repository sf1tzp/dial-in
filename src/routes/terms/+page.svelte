<script lang="ts">
	import { resolve } from '$app/paths';
	import * as Card from '$lib/components/ui/card';
</script>

<svelte:head>
	<title>Terms of Service | Dial-in</title>
</svelte:head>

<h1 class="text-3xl font-bold">Terms of Service</h1>

<Card.Root class="mt-4">
	<Card.Content class="space-y-6">
		<p class="text-sm text-muted-foreground">
			<strong>Effective Date:</strong> 2026-02-10 · <strong>Last Updated:</strong> 2026-02-10
		</p>
		<p>
			These terms govern your use of Dial-in, operated by Streetfortress Industries ("we", "us", "our"). By creating an account, you agree to these terms.
		</p>

		<div class="space-y-4">
			<h2 class="text-lg font-semibold">Accounts</h2>
			<ul class="list-disc list-inside space-y-1">
				<li>You must provide accurate information when creating an account.</li>
				<li>You are responsible for keeping your login credentials secure.</li>
				<li>One person per account. Shared/bot accounts are not permitted without prior approval.</li>
				<li>You must be at least 13 years old to use the Service.</li>
			</ul>
		</div>

		<div class="space-y-4">
			<h2 class="text-lg font-semibold">What You Can Do</h2>
			<p>Dial-in is a tool for tracking coffee brewing. You may use it to:</p>
			<ul class="list-disc list-inside space-y-1">
				<li>Log brews, beans, recipes, and tasting notes</li>
				<li>Manage your coffee bag inventory</li>
				<li>Export your data</li>
			</ul>
		</div>

		<div class="space-y-4">
			<h2 class="text-lg font-semibold">Acceptable Use</h2>
			<p>You agree not to:</p>
			<ul class="list-disc list-inside space-y-1">
				<li>Use the Service for anything illegal</li>
				<li>Attempt to access other users' accounts or data</li>
				<li>Reverse-engineer, scrape, or abuse the API beyond normal use</li>
				<li>Upload malicious content or attempt to compromise the Service</li>
				<li>Resell access to the Service without written permission</li>
			</ul>
			<p>We reserve the right to suspend or terminate accounts that violate these terms.</p>
		</div>

		<div class="space-y-4">
			<h2 class="text-lg font-semibold">Subscriptions and Billing</h2>
			<ul class="list-disc list-inside space-y-1">
				<li>Dial-in may offer free and paid tiers.</li>
				<li>Paid subscriptions are billed through Stripe on a recurring basis (monthly or annual, as selected).</li>
				<li>You can cancel your subscription at any time. Cancellation takes effect at the end of your current billing period.</li>
				<li>We do not offer prorated refunds for partial billing periods, but we will consider refund requests on a case-by-case basis for recent charges.</li>
				<li>We may change pricing with at least 30 days' notice. Price changes apply at the start of your next billing period after the notice period.</li>
			</ul>
		</div>

		<div class="space-y-4">
			<h2 class="text-lg font-semibold">Your Data</h2>
			<ul class="list-disc list-inside space-y-1">
				<li><strong>You own your data.</strong> The coffee/brew data you enter belongs to you.</li>
				<li>We need a license to host and display your data back to you — you grant us a limited license to store, process, and display your content solely to provide the Service.</li>
				<li>You can export your data at any time via the in-app export feature.</li>
				<li>You can request deletion of your account and data per our <a href={resolve('/privacy')} class="underline">Privacy Policy</a>.</li>
			</ul>
		</div>

		<div class="space-y-4">
			<h2 class="text-lg font-semibold">Service Availability</h2>
			<ul class="list-disc list-inside space-y-1">
				<li>We aim to keep Dial-in available and reliable, but we do not guarantee 100% uptime.</li>
				<li>We may perform maintenance that temporarily affects availability. We will provide advance notice for planned maintenance when possible.</li>
				<li>We reserve the right to modify or discontinue features. For significant changes, we will provide at least 30 days' notice.</li>
			</ul>
		</div>

		<div class="space-y-4">
			<h2 class="text-lg font-semibold">Limitation of Liability</h2>
			<p>To the maximum extent permitted by law:</p>
			<ul class="list-disc list-inside space-y-1">
				<li>The Service is provided "as is" without warranties of any kind, express or implied.</li>
				<li>Streetfortress Industries is not liable for any indirect, incidental, special, consequential, or punitive damages.</li>
				<li>Our total liability for any claim related to the Service is limited to the amount you paid us in the 12 months preceding the claim, or $50, whichever is greater.</li>
			</ul>
			<p class="text-sm text-muted-foreground">This does not affect any rights that cannot be waived or limited under applicable law.</p>
		</div>

		<div class="space-y-4">
			<h2 class="text-lg font-semibold">Termination</h2>
			<ul class="list-disc list-inside space-y-1">
				<li>You can delete your account at any time.</li>
				<li>We may suspend or terminate your account if you violate these terms, with notice where practical.</li>
				<li>Upon termination, your right to use the Service ends. We will retain or delete your data per our <a href={resolve('/privacy')} class="underline">Privacy Policy</a>.</li>
			</ul>
		</div>

		<div class="space-y-4">
			<h2 class="text-lg font-semibold">Disputes</h2>
			<ul class="list-disc list-inside space-y-1">
				<li>These terms are governed by the laws of the United States.</li>
				<li>We prefer to resolve disputes informally. Contact us first, and we will try to work things out.</li>
				<li>If informal resolution fails, disputes will be resolved through binding arbitration or small claims court, at your option.</li>
			</ul>
		</div>

		<div class="space-y-4">
			<h2 class="text-lg font-semibold">Changes to These Terms</h2>
			<p>We may update these terms. Material changes will be communicated via email or in-app notification at least 30 days before taking effect. Continued use after changes take effect constitutes acceptance.</p>
		</div>

		<div class="space-y-4">
			<h2 class="text-lg font-semibold">Contact</h2>
			<p>
				Questions about these terms? Contact:<br />
				<strong>Streetfortress Industries</strong><br />
				Email: <a href="mailto:legal@streetfortress.com" class="underline">legal@streetfortress.com</a>
			</p>
		</div>

		<div class="space-y-4">
			<h2 class="text-lg font-semibold">Revision History</h2>
			<table class="w-full text-sm">
				<thead>
					<tr class="border-b">
						<th class="p-2 text-left">Date</th>
						<th class="p-2 text-left">Change</th>
					</tr>
				</thead>
				<tbody>
					<tr class="border-b">
						<td class="p-2">2026-02-10</td>
						<td class="p-2">Initial draft</td>
					</tr>
				</tbody>
			</table>
		</div>
	</Card.Content>
</Card.Root>
