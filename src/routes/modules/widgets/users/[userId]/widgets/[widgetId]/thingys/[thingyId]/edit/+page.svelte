<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { Button, Input, Label, Textarea } from '$lib/components/ui';
	import { ArrowLeft } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	let { data, form } = $props();
</script>

<svelte:head>
	<title>Edit {data.thingy.name}</title>
	<meta name="description" content="Edit thingy details" />
</svelte:head>

<div class="max-w-xl mx-auto px-6 py-16">
	<a
		href="/modules/widgets/users/{data.targetUser.id}/widgets/{data.widget.id}/thingys/{data.thingy.id}"
		class="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 mb-6"
	>
		<ArrowLeft class="w-4 h-4" />
		Back to Thingy
	</a>

	<div class="border border-zinc-200 rounded-lg p-6 bg-white">
		<h1 class="text-2xl font-semibold tracking-tight mb-6">Edit Thingy</h1>

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
						toast.success('Thingy updated!');
						goto(`/modules/widgets/users/${data.targetUser.id}/widgets/${data.widget.id}/thingys/${data.thingy.id}`);
					} else if (result.type === 'failure') {
						toast.error((result.data as { error?: string })?.error || 'Failed to update thingy');
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
					value={data.thingy.name}
					placeholder="Enter thingy name"
					required
				/>
			</div>

			<div class="space-y-2">
				<Label.Root for="description">Description</Label.Root>
				<Textarea.Root
					id="description"
					name="description"
					value={data.thingy.description || ''}
					placeholder="Enter thingy description (optional)"
					rows={4}
				/>
			</div>

			<div class="flex gap-3 pt-4">
				<Button.Root type="submit">Save Changes</Button.Root>
				<Button.Root type="button" variant="outline" onclick={() => goto(`/modules/widgets/users/${data.targetUser.id}/widgets/${data.widget.id}/thingys/${data.thingy.id}`)}>
					Cancel
				</Button.Root>
			</div>
		</form>
	</div>
</div>
