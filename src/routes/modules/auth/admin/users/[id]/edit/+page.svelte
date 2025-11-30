<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { Button, Input, Label, Checkbox } from '$lib/components/ui';
	import { ArrowLeft } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	let { data, form } = $props();
</script>

<svelte:head>
	<title>Edit {data.targetUser.name || data.targetUser.email} - The Office</title>
	<meta name="description" content="Edit employee details" />
</svelte:head>

<div class="max-w-xl mx-auto px-6 py-16">
	<a
		href="/modules/auth/admin/users/{data.targetUser.id}"
		class="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
	>
		<ArrowLeft class="w-4 h-4" />
		Back to Employee
	</a>

	<div class="border border-border rounded-lg p-6 bg-card">
		<h1 class="text-2xl font-semibold tracking-tight mb-6">Edit Employee</h1>

		{#if form?.error}
			<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
				{form.error}
			</div>
		{/if}

		<form
			method="POST"
			use:enhance={() => {
				return async ({ result }) => {
					if (result.type === 'redirect') {
						toast.success('User updated successfully');
						goto(`/modules/auth/admin/users/${data.targetUser.id}`);
					} else if (result.type === 'failure') {
						toast.error((result.data as { error?: string })?.error || 'Failed to update user');
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
					value={data.targetUser.name || ''}
					placeholder="Enter name"
				/>
			</div>

			<div class="space-y-2">
				<Label.Root for="email">Email</Label.Root>
				<Input.Root
					id="email"
					name="email"
					type="email"
					value={data.targetUser.email}
					placeholder="Enter email"
					required
				/>
			</div>

			<div class="flex items-center gap-2 pt-2">
				<Checkbox.Root
					id="admin"
					name="admin"
					checked={data.targetUser.admin}
					disabled={data.targetUser.id === data.currentUser.id}
				/>
				<Label.Root for="admin" class="text-sm font-normal">
					Regional Manager privileges
					{#if data.targetUser.id === data.currentUser.id}
						<span class="text-muted-foreground">(cannot change your own admin status)</span>
					{/if}
				</Label.Root>
			</div>

			<div class="flex gap-3 pt-4">
				<Button.Root type="submit">Save Changes</Button.Root>
				<Button.Root type="button" variant="outline" onclick={() => goto(`/modules/auth/admin/users/${data.targetUser.id}`)}>
					Cancel
				</Button.Root>
			</div>
		</form>
	</div>
</div>
