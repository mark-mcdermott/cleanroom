<script lang="ts">
	import { goto } from '$app/navigation';
	import { enhance } from '$app/forms';
	import { Button, Table } from '$lib/components/ui';
	import { RotateCcw, Users, Layers, Package, StickyNote, Image, Images } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	let { data } = $props();
</script>

<svelte:head>
	<title>Widgets Admin</title>
	<meta name="description" content="Admin dashboard for widgets module" />
</svelte:head>

<div class="max-w-6xl mx-auto px-6 py-16">
	<div class="flex items-center justify-between mb-8">
		<div>
			<h1 class="text-3xl font-semibold tracking-tight">Widgets Admin</h1>
			<p class="text-zinc-600 mt-2">Manage all users and their widgets</p>
		</div>
		<form method="POST" action="?/reset" use:enhance={() => {
			return async ({ result }) => {
				if (result.type === 'success') {
					toast.success('Demo reset! Logged in as Michael Scott.');
					window.location.reload();
				} else if (result.type === 'failure') {
					toast.error((result.data as { error?: string })?.error || 'Failed to reset');
				}
			};
		}}>
			<Button.Root type="submit" variant="outline" class="cursor-pointer">
				<RotateCcw class="w-4 h-4 mr-2" />
				Reset Demo
			</Button.Root>
		</form>
	</div>

	<!-- Stats Grid -->
	<div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
		<div class="bg-white border border-zinc-200 rounded-lg p-4">
			<div class="flex items-center gap-3">
				<Package class="w-8 h-8 text-blue-500" />
				<div>
					<p class="text-2xl font-semibold">{data.stats.totalWidgets}</p>
					<p class="text-sm text-zinc-500">Widgets</p>
				</div>
			</div>
		</div>
		<div class="bg-white border border-zinc-200 rounded-lg p-4">
			<div class="flex items-center gap-3">
				<Layers class="w-8 h-8 text-green-500" />
				<div>
					<p class="text-2xl font-semibold">{data.stats.totalThingys}</p>
					<p class="text-sm text-zinc-500">Thingys</p>
				</div>
			</div>
		</div>
		<div class="bg-white border border-zinc-200 rounded-lg p-4">
			<div class="flex items-center gap-3">
				<StickyNote class="w-8 h-8 text-yellow-500" />
				<div>
					<p class="text-2xl font-semibold">{data.stats.totalNotes}</p>
					<p class="text-sm text-zinc-500">Notes</p>
				</div>
			</div>
		</div>
		<div class="bg-white border border-zinc-200 rounded-lg p-4">
			<div class="flex items-center gap-3">
				<Image class="w-8 h-8 text-purple-500" />
				<div>
					<p class="text-2xl font-semibold">{data.stats.totalPhotos}</p>
					<p class="text-sm text-zinc-500">Photos</p>
				</div>
			</div>
		</div>
		<div class="bg-white border border-zinc-200 rounded-lg p-4">
			<div class="flex items-center gap-3">
				<Images class="w-8 h-8 text-pink-500" />
				<div>
					<p class="text-2xl font-semibold">{data.stats.totalGalleries}</p>
					<p class="text-sm text-zinc-500">Galleries</p>
				</div>
			</div>
		</div>
	</div>

	<!-- Users Table -->
	<div class="bg-white border border-zinc-200 rounded-lg overflow-hidden">
		<div class="px-6 py-4 border-b border-zinc-200">
			<h2 class="text-lg font-semibold flex items-center gap-2">
				<Users class="w-5 h-5 text-zinc-400" />
				All Users ({data.users.length})
			</h2>
		</div>
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head>User</Table.Head>
					<Table.Head>Email</Table.Head>
					<Table.Head>Role</Table.Head>
					<Table.Head>Widgets</Table.Head>
					<Table.Head>Joined</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each data.users as user}
					<Table.Row class="cursor-pointer" onclick={() => goto(`/modules/widgets/users/${user.id}/widgets`)}>
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
								<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">Admin</span>
							{:else}
								<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-zinc-100 text-zinc-700">User</span>
							{/if}
						</Table.Cell>
						<Table.Cell>{user.widgetCount}</Table.Cell>
						<Table.Cell class="text-zinc-500">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>
</div>
