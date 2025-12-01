<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button, Input, Label } from '$lib/components/ui';
	import { ArrowLeft } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	let { data, form } = $props();
</script>

<svelte:head>
	<title>Account Settings</title>
	<meta name="description" content="Manage your account settings" />
</svelte:head>

<div class="max-w-xl mx-auto px-6 py-16">
	<a
		href="/modules/auth"
		class="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
	>
		<ArrowLeft class="w-4 h-4" />
		Back to Home
	</a>

	<div class="border border-border rounded-lg p-6 bg-card">
		<h1 class="text-2xl font-semibold tracking-tight mb-6">Account Settings</h1>

		{#if form?.error}
			<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
				{form.error}
			</div>
		{/if}

		<form
			method="POST"
			use:enhance={() => {
				return async ({ result, update }) => {
					if (result.type === 'success') {
						toast.success('Profile updated successfully');
						await update();
					} else if (result.type === 'failure') {
						toast.error((result.data as { error?: string })?.error || 'Failed to update profile');
					}
				};
			}}
			class="space-y-4"
		>
			<div class="space-y-2">
				<Label.Root for="name">Name</Label.Root>
				<Input.Root
					id="name"
					name="name"
					type="text"
					value={data.user.name || ''}
					placeholder="Enter your name"
				/>
			</div>

			<div class="space-y-2">
				<Label.Root for="email">Email</Label.Root>
				<Input.Root
					id="email"
					name="email"
					type="email"
					value={data.user.email}
					placeholder="Enter your email"
					required
				/>
			</div>

			<div class="flex gap-3 pt-4">
				<Button.Root type="submit">Save Changes</Button.Root>
			</div>
		</form>
	</div>
</div>
