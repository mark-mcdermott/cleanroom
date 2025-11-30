<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui';
	import { ArrowLeft, Pencil, Trash2 } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	let { data } = $props();

	function handleDelete() {
		if (confirm(`Are you sure you want to delete ${data.targetUser.name || data.targetUser.email}?`)) {
			const form = document.getElementById('delete-form') as HTMLFormElement;
			form.requestSubmit();
		}
	}
</script>

<svelte:head>
	<title>{data.targetUser.name || data.targetUser.email} - The Office</title>
	<meta name="description" content="View employee details" />
</svelte:head>

<div class="max-w-2xl mx-auto px-6 py-16">
	<a
		href="/modules/auth/admin/users"
		class="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
	>
		<ArrowLeft class="w-4 h-4" />
		Back to The Office
	</a>

	<div class="bg-card border border-border rounded-lg p-6">
		<div class="flex items-start gap-4 mb-6">
			<div class="w-16 h-16 bg-muted rounded-full flex items-center justify-center text-2xl font-medium">
				{data.targetUser.name?.charAt(0).toUpperCase() || data.targetUser.email.charAt(0).toUpperCase()}
			</div>
			<div class="flex-1">
				<h1 class="text-2xl font-semibold tracking-tight">
					{data.targetUser.name || 'No name'}
				</h1>
				<p class="text-muted-foreground">{data.targetUser.email}</p>
				{#if data.targetUser.admin}
					<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 mt-2">
						Regional Manager
					</span>
				{:else}
					<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground mt-2">
						Staff
					</span>
				{/if}
			</div>
		</div>

		<div class="space-y-3 text-sm border-t border-border pt-6">
			<div class="flex justify-between">
				<span class="text-muted-foreground">Employee ID</span>
				<span class="font-mono text-muted-foreground">{data.targetUser.id}</span>
			</div>
			<div class="flex justify-between">
				<span class="text-muted-foreground">Hired</span>
				<span class="text-muted-foreground">
					{data.targetUser.createdAt ? new Date(data.targetUser.createdAt).toLocaleString() : 'N/A'}
				</span>
			</div>
			<div class="flex justify-between">
				<span class="text-muted-foreground">Updated</span>
				<span class="text-muted-foreground">
					{data.targetUser.updatedAt ? new Date(data.targetUser.updatedAt).toLocaleString() : 'N/A'}
				</span>
			</div>
		</div>

		{#if data.currentUser.admin}
			<div class="flex gap-3 mt-8 pt-6 border-t border-border">
				<Button.Root variant="outline" class="flex items-center gap-2 cursor-pointer" onclick={() => goto(`/modules/auth/admin/users/${data.targetUser.id}/edit`)}>
					<Pencil class="w-4 h-4" />
					Edit
				</Button.Root>
				{#if data.targetUser.id !== data.currentUser.id}
					<Button.Root variant="destructive" class="flex items-center gap-2 cursor-pointer" onclick={handleDelete}>
						<Trash2 class="w-4 h-4" />
						Delete
					</Button.Root>
				{/if}
			</div>
		{/if}
	</div>
</div>

<form
	id="delete-form"
	method="POST"
	action="?/delete"
	use:enhance={() => {
		return async ({ result }) => {
			if (result.type === 'redirect') {
				toast.success('User deleted successfully');
				goto('/modules/auth/admin/users');
			} else if (result.type === 'failure') {
				toast.error((result.data as { error?: string })?.error || 'Failed to delete user');
			} else if (result.type === 'error') {
				toast.error('An error occurred while deleting the user');
			}
		};
	}}
	class="hidden"
></form>
