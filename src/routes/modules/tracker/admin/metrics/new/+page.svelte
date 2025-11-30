<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { Button, Input, Label, Textarea, Select } from '$lib/components/ui';
	import { ArrowLeft, Loader2, Save } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	let { data } = $props();

	let isSubmitting = $state(false);

	const valueTypes = [
		{ value: 'number', label: 'Number', description: 'Numeric values (e.g., steps, calories)' },
		{ value: 'rating', label: 'Rating', description: '1-5 star rating' },
		{ value: 'boolean', label: 'Yes/No', description: 'Simple yes or no' },
		{ value: 'text', label: 'Text', description: 'Free-form text' },
		{ value: 'duration', label: 'Duration', description: 'Time duration in minutes' }
	];
</script>

<svelte:head>
	<title>New Metric - Tracker Admin</title>
	<meta name="description" content="Create a new tracker metric" />
</svelte:head>

<div class="max-w-xl mx-auto px-6 py-8">
	<a
		href="/modules/tracker/admin"
		class="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-muted-foreground mb-8"
	>
		<ArrowLeft class="w-4 h-4" />
		Back to admin
	</a>

	<h1 class="text-3xl font-semibold tracking-tight mb-2">New Metric</h1>
	<p class="text-muted-foreground mb-8">Create a new metric to track</p>

	<form
		method="POST"
		use:enhance={() => {
			isSubmitting = true;
			return async ({ result }) => {
				isSubmitting = false;
				if (result.type === 'redirect') {
					toast.success('Metric created successfully!');
					goto(result.location);
				} else if (result.type === 'failure') {
					toast.error((result.data as { error?: string })?.error || 'Failed to create metric');
				}
			};
		}}
		class="space-y-6"
	>
		<!-- Name -->
		<div>
			<Label.Root for="name">Name *</Label.Root>
			<Input.Root type="text" id="name" name="name" placeholder="e.g., Steps" required class="mt-1.5" />
		</div>

		<!-- Category -->
		<div>
			<Label.Root for="categoryId">Category *</Label.Root>
			<Select.Root name="categoryId" required>
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
			<Select.Root name="valueType" value="number">
				<Select.Trigger class="w-full mt-1.5">
					<Select.Value placeholder="Select value type" />
				</Select.Trigger>
				<Select.Content>
					{#each valueTypes as type}
						<Select.Item value={type.value}>
							{type.label}
							<span class="text-muted-foreground ml-2">— {type.description}</span>
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
				placeholder="e.g., steps, lbs, min"
				class="mt-1.5"
			/>
			<p class="text-sm text-muted-foreground mt-1">The unit of measurement (optional)</p>
		</div>

		<!-- Icon -->
		<div>
			<Label.Root for="icon">Icon (Emoji)</Label.Root>
			<Input.Root type="text" id="icon" name="icon" placeholder="e.g., 👟" class="mt-1.5" />
		</div>

		<!-- Color -->
		<div>
			<Label.Root for="color">Color</Label.Root>
			<div class="flex items-center gap-3 mt-1.5">
				<Input.Root type="color" id="color" name="color" value="#3b82f6" class="w-16 h-10 p-1" />
				<span class="text-sm text-muted-foreground">Choose a color for charts and badges</span>
			</div>
		</div>

		<!-- Description -->
		<div>
			<Label.Root for="description">Description</Label.Root>
			<Textarea.Root
				id="description"
				name="description"
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
				placeholder="Optional default value"
				class="mt-1.5"
			/>
		</div>

		<!-- Min/Max Values -->
		<div class="grid grid-cols-2 gap-4">
			<div>
				<Label.Root for="minValue">Minimum Value</Label.Root>
				<Input.Root type="number" id="minValue" name="minValue" placeholder="0" class="mt-1.5" />
			</div>
			<div>
				<Label.Root for="maxValue">Maximum Value</Label.Root>
				<Input.Root type="number" id="maxValue" name="maxValue" placeholder="No limit" class="mt-1.5" />
			</div>
		</div>

		<!-- Submit -->
		<div class="flex items-center gap-4 pt-4">
			<Button.Root type="submit" class="cursor-pointer" disabled={isSubmitting}>
				{#if isSubmitting}
					<Loader2 class="w-4 h-4 mr-2 animate-spin" />
					Creating...
				{:else}
					<Save class="w-4 h-4 mr-2" />
					Create Metric
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
