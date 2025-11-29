<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto, invalidateAll } from '$app/navigation';
	import { Button, Input, Label, Checkbox } from '$lib/components/ui';
	import { ArrowLeft, Upload, Trash2, User } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	let { data, form } = $props();

	let uploading = $state(false);
	let avatarUrl = $state(data.targetUser.avatarUrl);
	let avatarCacheBuster = $state(0);
	let fileInput: HTMLInputElement;

	// Update avatarUrl when data changes
	$effect(() => {
		avatarUrl = data.targetUser.avatarUrl;
	});
</script>

<svelte:head>
	<title>Edit {data.targetUser.name || data.targetUser.email} - Users Admin</title>
	<meta name="description" content="Edit user details" />
</svelte:head>

<div class="max-w-xl mx-auto px-6 py-16">
	<a
		href="/admin/users/{data.targetUser.id}"
		class="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 mb-6"
	>
		<ArrowLeft class="w-4 h-4" />
		Back to User
	</a>

	<div class="bg-white border border-zinc-200 rounded-lg p-6">
		<h1 class="text-2xl font-semibold tracking-tight mb-6">Edit User</h1>

		{#if form?.error}
			<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
				{form.error}
			</div>
		{/if}

		<!-- Avatar Section -->
		<div class="mb-8 pb-6 border-b border-zinc-200">
			<Label.Root class="mb-3 block">Avatar</Label.Root>
			<div class="flex items-center gap-6">
				<!-- Avatar Preview -->
				<div class="relative">
					{#if avatarUrl}
						<img
							src="{avatarUrl}?v={avatarCacheBuster}"
							alt="User avatar"
							class="w-20 h-20 rounded-full object-cover border-2 border-zinc-200"
						/>
					{:else}
						<div class="w-20 h-20 rounded-full bg-zinc-100 border-2 border-zinc-200 flex items-center justify-center">
							<User class="w-8 h-8 text-zinc-400" />
						</div>
					{/if}
				</div>

				<!-- Upload/Remove Actions -->
				<div class="flex flex-col gap-2">
					<form
						method="POST"
						action="?/uploadAvatar"
						enctype="multipart/form-data"
						use:enhance={() => {
							uploading = true;
							return async ({ result, update }) => {
								uploading = false;
								if (result.type === 'success') {
									toast.success('Avatar uploaded successfully');
									avatarCacheBuster++;
									await invalidateAll();
								} else if (result.type === 'failure') {
									toast.error((result.data as { error?: string })?.error || 'Failed to upload avatar');
								}
								await update();
							};
						}}
					>
						<input
							bind:this={fileInput}
							type="file"
							name="avatar"
							accept="image/jpeg,image/png,image/gif,image/webp"
							class="hidden"
							onchange={(e) => e.currentTarget.form?.requestSubmit()}
						/>
						<Button.Root
							type="button"
							variant="outline"
							size="sm"
							disabled={uploading}
							onclick={() => fileInput.click()}
						>
							<Upload class="w-4 h-4 mr-2" />
							{uploading ? 'Uploading...' : 'Upload Photo'}
						</Button.Root>
					</form>

					{#if avatarUrl}
						<form
							method="POST"
							action="?/removeAvatar"
							use:enhance={() => {
								return async ({ result, update }) => {
									if (result.type === 'success') {
										toast.success('Avatar removed');
										avatarUrl = null;
										await invalidateAll();
									} else if (result.type === 'failure') {
										toast.error((result.data as { error?: string })?.error || 'Failed to remove avatar');
									}
									await update();
								};
							}}
						>
							<Button.Root type="submit" variant="ghost" size="sm" class="text-red-600 hover:text-red-700 hover:bg-red-50">
								<Trash2 class="w-4 h-4 mr-2" />
								Remove
							</Button.Root>
						</form>
					{/if}

					<p class="text-xs text-zinc-500">JPEG, PNG, GIF, or WebP. Max 5MB.</p>
				</div>
			</div>
		</div>

		<!-- User Details Form -->
		<form
			method="POST"
			action="?/updateUser"
			use:enhance={() => {
				return async ({ result }) => {
					if (result.type === 'redirect') {
						toast.success('User updated successfully');
						goto(`/admin/users/${data.targetUser.id}`);
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
					Admin privileges
					{#if data.targetUser.id === data.currentUser.id}
						<span class="text-zinc-500">(cannot change your own admin status)</span>
					{/if}
				</Label.Root>
			</div>

			<div class="flex gap-3 pt-4">
				<Button.Root type="submit">Save Changes</Button.Root>
				<Button.Root type="button" variant="outline" onclick={() => goto(`/admin/users/${data.targetUser.id}`)}>
					Cancel
				</Button.Root>
			</div>
		</form>
	</div>
</div>
