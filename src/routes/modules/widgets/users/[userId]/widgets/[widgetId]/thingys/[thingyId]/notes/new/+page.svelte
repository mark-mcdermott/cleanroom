<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { Button, Label, Textarea } from '$lib/components/ui';
	import { ArrowLeft } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	let { data, form } = $props();
</script>

<svelte:head>
	<title>New Note - {data.thingy.name}</title>
</svelte:head>

<div class="max-w-xl mx-auto px-6 py-16">
	<a href="/modules/widgets/users/{data.targetUser.id}/widgets/{data.widget.id}/thingys/{data.thingy.id}"
		class="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
		<ArrowLeft class="w-4 h-4" />Back to {data.thingy.name}
	</a>

	<div class="border border-border rounded-lg p-6 bg-card">
		<h1 class="text-2xl font-semibold tracking-tight mb-6">Add Note</h1>

		{#if form?.error}
			<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">{form.error}</div>
		{/if}

		<form method="POST" use:enhance={() => {
			return async ({ result }) => {
				if (result.type === 'redirect') {
					toast.success('Note added!');
					goto(result.location);
				} else if (result.type === 'failure') {
					toast.error((result.data as { error?: string })?.error || 'Failed to add note');
				}
			};
		}} class="space-y-4">
			<div class="space-y-2">
				<Label.Root for="content">Note</Label.Root>
				<Textarea.Root id="content" name="content" placeholder="Enter your note..." rows={6} required />
			</div>

			<div class="flex gap-3 pt-4">
				<Button.Root type="submit">Add Note</Button.Root>
				<Button.Root type="button" variant="outline" onclick={() => goto(`/modules/widgets/users/${data.targetUser.id}/widgets/${data.widget.id}/thingys/${data.thingy.id}`)}>Cancel</Button.Root>
			</div>
		</form>
	</div>
</div>
