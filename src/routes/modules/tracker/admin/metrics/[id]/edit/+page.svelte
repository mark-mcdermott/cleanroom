<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { Button, Input, Label, Textarea, Select } from '$lib/components/ui';
	import { ArrowLeft, Loader2, Save, Trash2, Archive, ArchiveRestore } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	let { data } = $props();

	let isSubmitting = $state(false);
	let isDeleting = $state(false);

	const valueTypes = [
		{ value: 'number', label: 'Number', description: 'Numeric values (e.g., steps, calories)' },
		{ value: 'rating', label: 'Rating', description: '1-5 star rating' },
		{ value: 'boolean', label: 'Yes/No', description: 'Simple yes or no' },
		{ value: 'text', label: 'Text', description: 'Free-form text' },
		{ value: 'duration', label: 'Duration', description: 'Time duration in minutes' }
	];

	function handleDelete() {
		if (confirm(`Are you sure you want to delete "${data.metric.name}"? This will also delete all entries for this metric.`)) {
			isDeleting = true;
			const form = document.createElement('form');
			form.method = 'POST';
			form.action = '?/delete';
			document.body.appendChild(form);
			form.requestSubmit();
			document.body.removeChild(form);
		}
	}
</script>

<svelte:head>
	<title>Edit {data.metric.name} - Tracker Admin</title>
	<meta name="description" content="Edit tracker metric" />
</svelte:head>

<div class="max-w-xl mx-auto px-6 py-8">
	<a
		href="/modules/tracker/admin"
		class="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-700 mb-8"
	>
		<ArrowLeft class="w-4 h-4" />
		Back to admin
	</a>

	<div class="flex items-start justify-between mb-8">
		<div>
			<h1 class="text-3xl font-semibold tracking-tight mb-2">Edit Metric</h1>
			<p class="text-zinc-500">
				<span class="text-2xl mr-2">{data.metric.icon || '📊'}</span>
				{data.metric.name}
			</p>
		</div>
		<button
			type="button"
			onclick={handleDelete}
			disabled={isDeleting}
			class="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
			title="Delete metric"
		>
			<Trash2 class="w-5 h-5" />
		</button>
	</div>

	<form
		method="POST"
		action="?/update"
		use:enhance={() => {
			isSubmitting = true;
			return async ({ result }) => {
				isSubmitting = false;
				if (result.type === 'redirect') {
					toast.success('Metric updated successfully!');
					goto(result.location);
				} else if (result.type === 'failure') {
					toast.error((result.data as { error?: string })?.error || 'Failed to update metric');
				}
			};
		}}
		class="space-y-6"
	>
		<!-- Name -->
		<div>
			<Label.Root for="name">Name *</Label.Root>
			<Input.Root
				type="text"
				id="name"
				name="name"
				value={data.metric.name}
				placeholder="e.g., Steps"
				required
				class="mt-1.5"
			/>
		</div>

		<!-- Category -->
		<div>
			<Label.Root for="categoryId">Category *</Label.Root>
			<Select.Root name="categoryId" value={data.metric.categoryId} required>
				<Select.Trigger class="w-full mt-1.5">
					<Select.Value placeholder="Select a category" />
				</Select.Trigger>
				<Select.Content>
					{#each data.categories as category}
						<Select.Item value={category.id}>
							{category.icon} {category.name}
						</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
		</div>

		<!-- Value Type -->
		<div>
			<Label.Root for="valueType">Value Type *</Label.Root>
			<Select.Root name="valueType" value={data.metric.valueType}>
				<Select.Trigger class="w-full mt-1.5">
					<Select.Value placeholder="Select value type" />
				</Select.Trigger>
				<Select.Content>
					{#each valueTypes as type}
						<Select.Item value={type.value}>
							{type.label}
							<span class="text-zinc-400 ml-2">— {type.description}</span>
						</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
		</div>

		<!-- Unit -->
		<div>
			<Label.Root for="unit">Unit</Label.Root>
			<Input.Root
				type="text"
				id="unit"
				name="unit"
				value={data.metric.unit || ''}
				placeholder="e.g., steps, lbs, min"
				class="mt-1.5"
			/>
		</div>

		<!-- Icon -->
		<div>
			<Label.Root for="icon">Icon (Emoji)</Label.Root>
			<Input.Root
				type="text"
				id="icon"
				name="icon"
				value={data.metric.icon || ''}
				placeholder="e.g., 👟"
				class="mt-1.5"
			/>
		</div>

		<!-- Color -->
		<div>
			<Label.Root for="color">Color</Label.Root>
			<div class="flex items-center gap-3 mt-1.5">
				<Input.Root
					type="color"
					id="color"
					name="color"
					value={data.metric.color || '#3b82f6'}
					class="w-16 h-10 p-1"
				/>
				<span class="text-sm text-zinc-500">Choose a color for charts and badges</span>
			</div>
		</div>

		<!-- Description -->
		<div>
			<Label.Root for="description">Description</Label.Root>
			<Textarea.Root
				id="description"
				name="description"
				value={data.metric.description || ''}
				placeholder="Brief description of this metric..."
				rows={2}
				class="mt-1.5"
			/>
		</div>

		<!-- Default Value -->
		<div>
			<Label.Root for="defaultValue">Default Value</Label.Root>
			<Input.Root
				type="text"
				id="defaultValue"
				name="defaultValue"
				value={data.metric.defaultValue || ''}
				placeholder="Optional default value"
				class="mt-1.5"
			/>
		</div>

		<!-- Min/Max Values -->
		<div class="grid grid-cols-2 gap-4">
			<div>
				<Label.Root for="minValue">Minimum Value</Label.Root>
				<Input.Root
					type="number"
					id="minValue"
					name="minValue"
					value={data.metric.minValue || ''}
					placeholder="0"
					class="mt-1.5"
				/>
			</div>
			<div>
				<Label.Root for="maxValue">Maximum Value</Label.Root>
				<Input.Root
					type="number"
					id="maxValue"
					name="maxValue"
					value={data.metric.maxValue || ''}
					placeholder="No limit"
					class="mt-1.5"
				/>
			</div>
		</div>

		<!-- Archived Status -->
		<div class="flex items-center justify-between p-4 bg-zinc-50 rounded-lg border border-border">
			<div>
				<p class="font-medium">Archive Metric</p>
				<p class="text-sm text-zinc-500">Archived metrics won't appear in the log form</p>
			</div>
			<label class="relative inline-flex items-center cursor-pointer">
				<input
					type="checkbox"
					name="archived"
					value="true"
					checked={data.metric.archived}
					class="sr-only peer"
				/>
				<div class="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-zinc-600"></div>
			</label>
		</div>

		<!-- Submit -->
		<div class="flex items-center gap-4 pt-4">
			<Button.Root type="submit" class="cursor-pointer" disabled={isSubmitting}>
				{#if isSubmitting}
					<Loader2 class="w-4 h-4 mr-2 animate-spin" />
					Saving...
				{:else}
					<Save class="w-4 h-4 mr-2" />
					Save Changes
				{/if}
			</Button.Root>
			<Button.Root
				type="button"
				variant="outline"
				onclick={() => goto('/modules/tracker/admin')}
				class="cursor-pointer"
			>
				Cancel
			</Button.Root>
		</div>
	</form>
</div>

<form method="POST" action="?/delete" class="hidden"></form>
