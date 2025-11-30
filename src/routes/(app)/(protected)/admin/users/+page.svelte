<script lang="ts">
	import { goto } from '$app/navigation';
	import { enhance } from '$app/forms';
	import { Table } from '$lib/components/ui';
	import { Pencil, Trash2 } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	let { data } = $props();

	function handleRowClick(userId: string) {
		goto(`/admin/users/${userId}`);
	}

	function handleDelete(userId: string, userName: string) {
		if (confirm(`Are you sure you want to delete ${userName || 'this user'}?`)) {
			const form = document.createElement('form');
			form.method = 'POST';
			form.action = `?/delete`;

			const input = document.createElement('input');
			input.type = 'hidden';
			input.name = 'userId';
			input.value = userId;
			form.appendChild(input);

			document.body.appendChild(form);
			form.requestSubmit();
			document.body.removeChild(form);
		}
	}
</script>

<svelte:head>
	<title>Users Admin - Cleanroom</title>
	<meta name="description" content="Manage users" />
</svelte:head>

<div class="max-w-4xl mx-auto px-6 py-16">
	<div class="mb-8">
		<h1 class="text-3xl font-semibold tracking-tight">Users</h1>
		<p class="text-muted-foreground mt-2">Manage all registered users ({data.users.length} total)</p>
	</div>

	{#if data.users.length === 0}
		<div class="border border-border rounded-lg p-8 text-center">
			<p class="text-muted-foreground">No users found. Run <code class="bg-muted px-2 py-1 rounded">pnpm db:seed</code> to create seed users.</p>
		</div>
	{:else}
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head>User</Table.Head>
					<Table.Head>Email</Table.Head>
					<Table.Head>Role</Table.Head>
					<Table.Head>Created</Table.Head>
					<Table.Head class="w-20"></Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each data.users as user}
					<Table.Row
						class="cursor-pointer"
						onclick={(e: MouseEvent) => {
							const target = e.target as HTMLElement;
							if (!target.closest('[data-action]')) {
								handleRowClick(user.id);
							}
						}}
					>
						<Table.Cell>
							<div class="flex items-center gap-3">
								<div class="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-sm font-medium overflow-hidden">
									{#if user.avatarUrl}
										<img src={user.avatarUrl} alt="User avatar" class="w-full h-full object-cover" />
									{:else}
										{user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
									{/if}
								</div>
								<span class="font-medium">{user.name || 'No name'}</span>
							</div>
						</Table.Cell>
						<Table.Cell class="text-muted-foreground">{user.email}</Table.Cell>
						<Table.Cell>
							{#if user.admin}
								<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
									Admin
								</span>
							{:else}
								<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
									User
								</span>
							{/if}
						</Table.Cell>
						<Table.Cell class="text-muted-foreground">
							{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
						</Table.Cell>
						<Table.Cell>
							<div class="flex items-center gap-2">
								<a
									href="/admin/users/{user.id}/edit"
									data-action="edit"
									class="p-1.5 rounded text-muted-foreground hover:text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
									title="Edit user"
									onclick={(e: MouseEvent) => e.stopPropagation()}
								>
									<Pencil class="w-4 h-4" />
								</a>
								<button
									data-action="delete"
									class="p-1.5 rounded text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
									title="Delete user"
									onclick={(e: MouseEvent) => {
										e.stopPropagation();
										handleDelete(user.id, user.name || user.email);
									}}
								>
									<Trash2 class="w-4 h-4" />
								</button>
							</div>
						</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	{/if}
</div>

<form method="POST" action="?/delete" use:enhance={() => {
	return async ({ result }) => {
		if (result.type === 'success') {
			toast.success('User deleted successfully');
			window.location.reload();
		} else if (result.type === 'failure') {
			toast.error((result.data as { error?: string })?.error || 'Failed to delete user');
		} else if (result.type === 'error') {
			toast.error('An error occurred while deleting the user');
		}
	};
}} class="hidden">
	<input type="hidden" name="userId" value="" />
</form>
