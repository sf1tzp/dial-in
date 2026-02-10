<script lang="ts">
	import * as Card from '$lib/components/ui/card';
</script>

<svelte:head>
	<title>Privacy Policy | Dial-in</title>
</svelte:head>

<h1 class="text-3xl font-bold">Privacy Policy</h1>

<Card.Root class="mt-4">
	<Card.Content class="space-y-6">
		<p class="text-sm text-muted-foreground">
			<strong>Effective Date:</strong> 2026-02-10 · <strong>Last Updated:</strong> 2026-02-10
		</p>
		<p>
			This privacy policy explains how Streetfortress Industries ("we", "us", "our") collects, uses, and protects your information when you use Dial-in ("the Service").
		</p>

		<div class="space-y-4">
			<h2 class="text-lg font-semibold">What We Collect</h2>

			<h3 class="font-medium">Account Information</h3>
			<ul class="list-disc list-inside space-y-1">
				<li>Email address (used for login and communication)</li>
				<li>Name (if provided)</li>
				<li>Authentication credentials managed via Better Auth</li>
			</ul>

			<h3 class="font-medium">Usage Data</h3>
			<ul class="list-disc list-inside space-y-1">
				<li>Coffee and brew data you enter (beans, recipes, tasting notes, grind settings, etc.)</li>
				<li>Bag and inventory information</li>
				<li>Timestamps of actions within the Service</li>
			</ul>

			<h3 class="font-medium">Technical Data</h3>
			<ul class="list-disc list-inside space-y-1">
				<li>Device type and browser information</li>
				<li>IP address</li>
				<li>Basic request logs for debugging and security</li>
			</ul>

			<h3 class="font-medium">Payment Information</h3>
			<p>
				Billing is handled by Stripe. We do not store your credit card number, CVC, or full card details on our servers. Stripe retains payment information per their own privacy policy.
			</p>
		</div>

		<div class="space-y-4">
			<h2 class="text-lg font-semibold">How We Use Your Data</h2>
			<ul class="list-disc list-inside space-y-1">
				<li><strong>Providing the Service:</strong> Storing and displaying your brew data, syncing across devices</li>
				<li><strong>Account management:</strong> Authentication, password resets, account communications</li>
				<li><strong>Billing:</strong> Processing subscription payments via Stripe</li>
				<li><strong>Improving the Service:</strong> Aggregated, anonymized usage patterns to guide development</li>
				<li><strong>Security:</strong> Detecting abuse, preventing unauthorized access</li>
			</ul>
			<p>We do not sell your personal data. We do not use your data for advertising.</p>
		</div>

		<div class="space-y-4">
			<h2 class="text-lg font-semibold">Third-Party Services</h2>
			<p>We rely on the following third-party services:</p>
			<table class="w-full text-sm">
				<thead>
					<tr class="border-b">
						<th class="p-2 text-left">Service</th>
						<th class="p-2 text-left">Purpose</th>
						<th class="p-2 text-left">Their Privacy Policy</th>
					</tr>
				</thead>
				<tbody>
					<tr class="border-b">
						<td class="p-2 font-medium">Stripe</td>
						<td class="p-2">Payment processing</td>
						<td class="p-2"><a href="https://stripe.com/privacy" class="underline">stripe.com/privacy</a></td>
					</tr>
					<tr class="border-b">
						<td class="p-2 font-medium">Better Auth</td>
						<td class="p-2">Authentication</td>
						<td class="p-2">Self-hosted; no third-party data sharing</td>
					</tr>
					<tr class="border-b">
						<td class="p-2 font-medium">S3-compatible storage</td>
						<td class="p-2">File/image storage</td>
						<td class="p-2">Depends on provider; data encrypted at rest</td>
					</tr>
				</tbody>
			</table>
			<p class="text-sm text-muted-foreground">We only share the minimum data each service needs to function.</p>
		</div>

		<div class="space-y-4">
			<h2 class="text-lg font-semibold">Cookies and Local Storage</h2>
			<ul class="list-disc list-inside space-y-1">
				<li><strong>Session cookies:</strong> Required for authentication — expire when you log out or after inactivity</li>
				<li><strong>Local storage:</strong> Used to cache preferences and offline data on your device</li>
			</ul>
			<p>We do not use tracking cookies or third-party analytics cookies.</p>
		</div>

		<div class="space-y-4">
			<h2 class="text-lg font-semibold">Data Retention</h2>
			<ul class="list-disc list-inside space-y-1">
				<li><strong>Account data:</strong> Retained while your account is active. Deleted within 30 days of account deletion request.</li>
				<li><strong>Brew/coffee data:</strong> Retained while your account is active. Available for export at any time.</li>
				<li><strong>Server logs:</strong> Retained for up to 90 days, then automatically purged.</li>
				<li><strong>Payment records:</strong> Retained as required by tax/legal obligations (typically 7 years for financial records).</li>
			</ul>
		</div>

		<div class="space-y-4">
			<h2 class="text-lg font-semibold">Your Rights</h2>
			<p>You have the right to:</p>
			<ul class="list-disc list-inside space-y-1">
				<li><strong>Access</strong> your data — export everything via the in-app export feature</li>
				<li><strong>Correct</strong> your data — edit any information through the app</li>
				<li><strong>Delete</strong> your data — request account deletion, and we will remove your personal data within 30 days</li>
				<li><strong>Port</strong> your data — download your data in a standard format</li>
			</ul>
			<p>To exercise these rights, contact us at the address below.</p>

			<h3 class="font-medium">GDPR (EU/EEA Users)</h3>
			<p>If you are in the EU/EEA, you also have the right to:</p>
			<ul class="list-disc list-inside space-y-1">
				<li>Object to processing based on legitimate interests</li>
				<li>Restrict processing in certain circumstances</li>
				<li>Lodge a complaint with your local data protection authority</li>
			</ul>
			<p>Our legal basis for processing is:</p>
			<ul class="list-disc list-inside space-y-1">
				<li><strong>Contract performance</strong> — providing the Service you signed up for</li>
				<li><strong>Legitimate interests</strong> — security, abuse prevention, service improvement</li>
				<li><strong>Consent</strong> — where explicitly requested (e.g., optional marketing emails)</li>
			</ul>
		</div>

		<div class="space-y-4">
			<h2 class="text-lg font-semibold">Data Security</h2>
			<p>We protect your data with:</p>
			<ul class="list-disc list-inside space-y-1">
				<li>HTTPS/TLS encryption in transit</li>
				<li>Encryption at rest for stored data</li>
				<li>Access controls limiting who can access production systems</li>
				<li>Regular security reviews</li>
			</ul>
		</div>

		<div class="space-y-4">
			<h2 class="text-lg font-semibold">Children</h2>
			<p>Dial-in is not directed at children under 13. We do not knowingly collect data from children under 13.</p>
		</div>

		<div class="space-y-4">
			<h2 class="text-lg font-semibold">Changes to This Policy</h2>
			<p>We will notify users of material changes via email or in-app notification at least 14 days before changes take effect.</p>
		</div>

		<div class="space-y-4">
			<h2 class="text-lg font-semibold">Contact</h2>
			<p>
				For privacy questions or data requests, contact:<br />
				<strong>Streetfortress Industries</strong><br />
				Email: <a href="mailto:privacy@streetfortress.com" class="underline">privacy@streetfortress.com</a>
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
