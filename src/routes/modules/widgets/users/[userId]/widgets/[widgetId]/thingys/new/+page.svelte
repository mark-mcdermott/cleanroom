<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { Button, Input, Label, Textarea } from '$lib/components/ui';
	import { ArrowLeft } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	let { data, form } = $props();
</script>

<svelte:head>
	<title>New Thingy - {data.widget.name}</title>
	<meta name="description" content="Create a new thingy" />
</svelte:head>

<div class="max-w-xl mx-auto px-6 py-16">
	<a
		href="/modules/widgets/users/{data.targetUser.id}/widgets/{data.widget.id}"
		class="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
	>
		<ArrowLeft class="w-4 h-4" />
		Back to {data.widget.name}
	</a>

	<div class="border border-border rounded-lg p-6 bg-card">
		<h1 class="text-2xl font-semibold tracking-tight mb-6">Create New Thingy</h1>

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
						toast.success('Thingy created!');
						goto(result.location);
					} else if (result.type === 'failure') {
						toast.error((result.data as { error?: string })?.error || 'Failed to create thingy');
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
					placeholder="Enter thingy name"
					required
				/>
			</div>

			<div class="space-y-2">
				<Label.Root for="description">Description</Label.Root>
				<Textarea.Root
					id="description"
					name="description"
					placeholder="Enter thingy description (optional)"
					rows={4}
				/>
			</div>

			<div class="flex gap-3 pt-4">
				<Button.Root type="submit">Create Thingy</Button.Root>
				<Button.Root type="button" variant="outline" onclick={() => goto(`/modules/widgets/users/${data.targetUser.id}/widgets/${data.widget.id}`)}>
					Cancel
				</Button.Root>
			</div>
		</form>
	</div>
</div>
