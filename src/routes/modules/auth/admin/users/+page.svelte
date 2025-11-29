<script lang="ts">
	import { goto } from '$app/navigation';
	import { enhance } from '$app/forms';
	import { Table, Button } from '$lib/components/ui';
	import { Pencil, Trash2, RotateCcw } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	let { data } = $props();

	function handleRowClick(userId: string) {
		goto(`/modules/auth/admin/users/${userId}`);
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
	<title>The Office - Dunder Mifflin Employee Portal</title>
	<meta name="description" content="Manage Dunder Mifflin employees" />
</svelte:head>

<div class="max-w-4xl mx-auto px-6 py-16">
	<div class="flex items-center justify-between mb-8">
		<div>
			<h1 class="text-3xl font-semibold tracking-tight">The Office</h1>
			<p class="text-zinc-600 mt-2">Dunder Mifflin Scranton Branch ({data.users.length} employees)</p>
		</div>
		<form method="POST" action="?/reset" use:enhance={() => {
			return async ({ result }) => {
				if (result.type === 'success') {
					toast.success('Demo reset! Logged in as Michael Scott.');
					window.location.reload();
				} else if (result.type === 'failure') {
					toast.error((result.data as { error?: string })?.error || 'Failed to reset demo');
				}
			};
		}}>
			<Button.Root type="submit" variant="outline" class="cursor-pointer">
				<RotateCcw class="w-4 h-4 mr-2" />
				Reset Demo
			</Button.Root>
		</form>
	</div>

	{#if data.users.length === 0}
		<div class="border border-zinc-200 rounded-lg p-8 text-center bg-white">
			<p class="text-zinc-600 mb-4">No employees found. Reset the demo to populate Dunder Mifflin staff.</p>
			<form method="POST" action="?/reset" use:enhance={() => {
				return async ({ result }) => {
					if (result.type === 'success') {
						toast.success('Demo reset! Logged in as Michael Scott.');
						window.location.reload();
					}
				};
			}}>
				<Button.Root type="submit" variant="outline" class="cursor-pointer">
					<RotateCcw class="w-4 h-4 mr-2" />
					Reset Demo Data
				</Button.Root>
			</form>
		</div>
	{:else}
		<Table.Root>
		<Table.Header>
			<Table.Row>
				<Table.Head>Employee</Table.Head>
				<Table.Head>Email</Table.Head>
				<Table.Head>Position</Table.Head>
				<Table.Head>Hired</Table.Head>
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
							<div class="w-8 h-8 bg-zinc-100 rounded-full flex items-center justify-center text-sm font-medium">
								{user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
							</div>
							<span class="font-medium">{user.name || 'No name'}</span>
						</div>
					</Table.Cell>
					<Table.Cell class="text-zinc-600">{user.email}</Table.Cell>
					<Table.Cell>
						{#if user.admin}
							<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
								Regional Manager
							</span>
						{:else}
							<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-zinc-100 text-zinc-700">
								Staff
							</span>
						{/if}
					</Table.Cell>
					<Table.Cell class="text-zinc-500">
						{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
					</Table.Cell>
					<Table.Cell>
						<div class="flex items-center gap-2">
							<a
								href="/modules/auth/admin/users/{user.id}/edit"
								data-action="edit"
								class="p-1.5 rounded text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200 transition-colors cursor-pointer"
								title="Edit user"
								onclick={(e: MouseEvent) => e.stopPropagation()}
							>
								<Pencil class="w-4 h-4" />
							</a>
							<button
								data-action="delete"
								class="p-1.5 rounded text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
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
