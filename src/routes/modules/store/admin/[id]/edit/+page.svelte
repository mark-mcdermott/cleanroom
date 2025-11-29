<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { Button, Input, Label, Textarea, Checkbox, Select } from '$lib/components/ui';
	import { ArrowLeft, Loader2, Trash2 } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	let { data } = $props();

	let isSubmitting = $state(false);
	let isDeleting = $state(false);

	function handleDelete() {
		if (confirm(`Are you sure you want to delete "${data.product.name}"?`)) {
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
	<title>Edit {data.product.name} - Store Admin</title>
	<meta name="description" content="Edit product" />
</svelte:head>

<div class="max-w-2xl mx-auto px-6 py-16">
	<a
		href="/modules/store/admin"
		class="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-700 mb-8"
	>
		<ArrowLeft class="w-4 h-4" />
		Back to products
	</a>

	<div class="flex items-center justify-between mb-8">
		<h1 class="text-3xl font-semibold tracking-tight">Edit Product</h1>
		<Button.Root
			variant="outline"
			onclick={handleDelete}
			disabled={isDeleting}
			class="text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
		>
			{#if isDeleting}
				<Loader2 class="w-4 h-4 mr-2 animate-spin" />
			{:else}
				<Trash2 class="w-4 h-4 mr-2" />
			{/if}
			Delete
		</Button.Root>
	</div>

	<form
		method="POST"
		action="?/update"
		use:enhance={() => {
			isSubmitting = true;
			return async ({ result }) => {
				isSubmitting = false;
				if (result.type === 'redirect') {
					toast.success('Product updated successfully');
					goto(result.location);
				} else if (result.type === 'failure') {
					toast.error((result.data as { error?: string })?.error || 'Failed to update product');
				}
			};
		}}
		class="space-y-6"
	>
		<!-- Basic Info -->
		<div class="space-y-4">
			<h2 class="text-lg font-semibold">Basic Information</h2>

			<div>
				<Label.Root for="name">Name *</Label.Root>
				<Input.Root
					type="text"
					id="name"
					name="name"
					value={data.product.name}
					placeholder="Product name"
					required
					class="mt-1.5"
				/>
			</div>

			<div>
				<Label.Root for="slug">Slug *</Label.Root>
				<Input.Root
					type="text"
					id="slug"
					name="slug"
					value={data.product.slug}
					placeholder="product-slug"
					required
					class="mt-1.5"
				/>
				<p class="text-xs text-zinc-500 mt-1">URL-friendly identifier</p>
			</div>

			<div>
				<Label.Root for="description">Description</Label.Root>
				<Textarea.Root
					id="description"
					name="description"
					value={data.product.description || ''}
					placeholder="Product description..."
					rows={4}
					class="mt-1.5"
				/>
			</div>
		</div>

		<!-- Pricing -->
		<div class="space-y-4">
			<h2 class="text-lg font-semibold">Pricing</h2>

			<div class="grid grid-cols-2 gap-4">
				<div>
					<Label.Root for="price">Price *</Label.Root>
					<div class="relative mt-1.5">
						<span class="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">$</span>
						<Input.Root
							type="number"
							id="price"
							name="price"
							value={data.product.priceDisplay}
							placeholder="0.00"
							step="0.01"
							min="0"
							required
							class="pl-7"
						/>
					</div>
				</div>
				<div>
					<Label.Root for="compareAtPrice">Compare at Price</Label.Root>
					<div class="relative mt-1.5">
						<span class="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">$</span>
						<Input.Root
							type="number"
							id="compareAtPrice"
							name="compareAtPrice"
							value={data.product.compareAtPriceDisplay}
							placeholder="0.00"
							step="0.01"
							min="0"
							class="pl-7"
						/>
					</div>
					<p class="text-xs text-zinc-500 mt-1">Original price if on sale</p>
				</div>
			</div>
		</div>

		<!-- Inventory & Category -->
		<div class="space-y-4">
			<h2 class="text-lg font-semibold">Inventory & Organization</h2>

			<div class="grid grid-cols-2 gap-4">
				<div>
					<Label.Root for="inventory">Stock Quantity</Label.Root>
					<Input.Root
						type="number"
						id="inventory"
						name="inventory"
						value={data.product.inventory}
						placeholder="0"
						min="0"
						class="mt-1.5"
					/>
				</div>
				<div>
					<Label.Root for="categoryId">Category</Label.Root>
					<Select.Root name="categoryId" value={data.product.categoryId || undefined}>
						<Select.Trigger class="w-full mt-1.5">
							<Select.Value placeholder="Select category" />
						</Select.Trigger>
						<Select.Content>
							{#each data.categories as category}
								<Select.Item value={category.id}>{category.name}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>
			</div>
		</div>

		<!-- Image -->
		<div class="space-y-4">
			<h2 class="text-lg font-semibold">Media</h2>

			<div>
				<Label.Root for="image">Image URL</Label.Root>
				<Input.Root
					type="url"
					id="image"
					name="image"
					value={data.product.image || ''}
					placeholder="https://example.com/image.jpg"
					class="mt-1.5"
				/>
				<p class="text-xs text-zinc-500 mt-1">Enter a URL for the product image</p>
			</div>

			{#if data.product.image}
				<div class="mt-2">
					<img
						src={data.product.image}
						alt={data.product.name}
						class="w-32 h-32 object-cover rounded-lg"
					/>
				</div>
			{/if}
		</div>

		<!-- Status -->
		<div class="space-y-4">
			<h2 class="text-lg font-semibold">Status</h2>

			<div class="flex items-center gap-6">
				<div class="flex items-center gap-2">
					<Checkbox.Root id="published" name="published" checked={data.product.published} />
					<Label.Root for="published" class="cursor-pointer">Published</Label.Root>
				</div>
				<div class="flex items-center gap-2">
					<Checkbox.Root id="featured" name="featured" checked={data.product.featured} />
					<Label.Root for="featured" class="cursor-pointer">Featured</Label.Root>
				</div>
			</div>
		</div>

		<!-- Actions -->
		<div class="flex items-center gap-4 pt-4">
			<Button.Root type="submit" class="cursor-pointer" disabled={isSubmitting}>
				{#if isSubmitting}
					<Loader2 class="w-4 h-4 mr-2 animate-spin" />
					Saving...
				{:else}
					Save Changes
				{/if}
			</Button.Root>
			<Button.Root
				type="button"
				variant="outline"
				onclick={() => goto('/modules/store/admin')}
				class="cursor-pointer"
			>
				Cancel
			</Button.Root>
		</div>
	</form>
</div>

<form
	method="POST"
	action="?/delete"
	use:enhance={() => {
		return async ({ result }) => {
			if (result.type === 'redirect') {
				toast.success('Product deleted successfully');
				goto(result.location);
			} else if (result.type === 'failure') {
				isDeleting = false;
				toast.error((result.data as { error?: string })?.error || 'Failed to delete product');
			}
		};
	}}
	class="hidden"
></form>
