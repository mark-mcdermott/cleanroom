<script lang="ts">
	import { Card, Button, Input, Label } from '$lib/components/ui';
	import { Settings, User, Mail, Lock } from 'lucide-svelte';

	const { data } = $props();
</script>

<svelte:head>
	<title>Settings - cleanroom</title>
	<meta name="description" content="Account Settings" />
</svelte:head>

<div class="max-w-2xl mx-auto px-6 py-12">
	<h1 class="mb-8 flex items-center gap-3">
		<Settings class="w-8 h-8" />
		Account Settings
	</h1>

	{#if !data.user}
		<Card.Root>
			<Card.Content class="py-8 text-center">
				<p class="text-zinc-600 mb-4">You need to be logged in to access settings.</p>
				<a href="/login">
					<Button.Root>Log In</Button.Root>
				</a>
			</Card.Content>
		</Card.Root>
	{:else}
		<div class="space-y-6">
			<!-- Profile Section -->
			<Card.Root>
				<Card.Header>
					<Card.Title class="flex items-center gap-2">
						<User class="w-5 h-5" />
						Profile
					</Card.Title>
					<Card.Description>Manage your profile information</Card.Description>
				</Card.Header>
				<Card.Content class="space-y-4">
					<div>
						<Label.Root for="name">Display Name</Label.Root>
						<Input.Root
							id="name"
							value={data.user.name || ''}
							placeholder="Enter your display name"
						/>
					</div>
					<div>
						<Label.Root for="email">Email</Label.Root>
						<Input.Root id="email" value={data.user.email} disabled />
						<p class="text-xs text-zinc-500 mt-1">Email cannot be changed</p>
					</div>
				</Card.Content>
				<Card.Footer>
					<Button.Root disabled>Save Changes</Button.Root>
					<p class="text-xs text-zinc-500 ml-3">Coming soon</p>
				</Card.Footer>
			</Card.Root>

			<!-- Security Section -->
			<Card.Root>
				<Card.Header>
					<Card.Title class="flex items-center gap-2">
						<Lock class="w-5 h-5" />
						Security
					</Card.Title>
					<Card.Description>Manage your password and security settings</Card.Description>
				</Card.Header>
				<Card.Content class="space-y-4">
					<div>
						<Label.Root for="current-password">Current Password</Label.Root>
						<Input.Root id="current-password" type="password" placeholder="••••••••" />
					</div>
					<div>
						<Label.Root for="new-password">New Password</Label.Root>
						<Input.Root id="new-password" type="password" placeholder="••••••••" />
					</div>
					<div>
						<Label.Root for="confirm-password">Confirm New Password</Label.Root>
						<Input.Root id="confirm-password" type="password" placeholder="••••••••" />
					</div>
				</Card.Content>
				<Card.Footer>
					<Button.Root disabled>Update Password</Button.Root>
					<p class="text-xs text-zinc-500 ml-3">Coming soon</p>
				</Card.Footer>
			</Card.Root>

			<!-- Account ID -->
			<Card.Root>
				<Card.Header>
					<Card.Title class="flex items-center gap-2">
						<Mail class="w-5 h-5" />
						Account Info
					</Card.Title>
				</Card.Header>
				<Card.Content>
					<p class="text-sm text-zinc-600">
						<span class="font-medium">User ID:</span>
						<code class="ml-2 px-2 py-1 bg-zinc-100 rounded text-xs">{data.user.id}</code>
					</p>
				</Card.Content>
			</Card.Root>
		</div>
	{/if}
</div>
