<script lang="ts">
	import { goto } from '$app/navigation';
	import { enhance } from '$app/forms';
	import { Table, Button } from '$lib/components/ui';
	import { Plus, Pencil, Trash2, Eye, EyeOff, RotateCcw, Star } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	let { data } = $props();

	function handleRowClick(productId: string) {
		goto(`/modules/store/admin/${productId}/edit`);
	}

	function handleDelete(productId: string, productName: string) {
		if (confirm(`Are you sure you want to delete "${productName}"?`)) {
			const form = document.createElement('form');
			form.method = 'POST';
			form.action = '?/delete';

			const input = document.createElement('input');
			input.type = 'hidden';
			input.name = 'productId';
			input.value = productId;
			form.appendChild(input);

			document.body.appendChild(form);
			form.requestSubmit();
			document.body.removeChild(form);
		}
	}

	function formatPrice(value: string): string {
		const num = parseFloat(value);
		return (num / 100).toFixed(2);
	}

	function formatDate(date: Date | string | null) {
		if (!date) return 'N/A';
		return new Date(date).toLocaleDateString();
	}
</script>

<svelte:head>
	<title>Products Admin - Store Demo</title>
	<meta name="description" content="Manage demo store products" />
</svelte:head>

<div class="max-w-5xl mx-auto px-6 py-16">
	<div class="flex items-center justify-between mb-8">
		<div>
			<h1 class="text-3xl font-semibold tracking-tight">Products</h1>
			<p class="text-zinc-600 mt-2">Manage demo store products ({data.products.length} total)</p>
		</div>
		<div class="flex gap-3">
			<form
				method="POST"
				action="?/reset"
				use:enhance={() => {
					return async ({ result }) => {
						if (result.type === 'success') {
							toast.success('Demo data reset successfully');
							window.location.reload();
						} else if (result.type === 'failure') {
							toast.error(
								(result.data as { error?: string })?.error || 'Failed to reset demo data'
							);
						}
					};
				}}
			>
				<Button.Root type="submit" variant="outline" class="cursor-pointer">
					<RotateCcw class="w-4 h-4 mr-2" />
					Reset Demo
				</Button.Root>
			</form>
			<Button.Root class="cursor-pointer" onclick={() => goto('/modules/store/admin/new')}>
				<Plus class="w-4 h-4 mr-2" />
				New Product
			</Button.Root>
		</div>
	</div>

	{#if data.products.length === 0}
		<div class="border border-zinc-200 rounded-lg p-8 text-center bg-white">
			<p class="text-zinc-600 mb-4">No products yet. Create a new product or reset demo data to get started.</p>
			<div class="flex justify-center gap-3">
				<form
					method="POST"
					action="?/reset"
					use:enhance={() => {
						return async ({ result }) => {
							if (result.type === 'success') {
								toast.success('Demo data reset successfully');
								window.location.reload();
							}
						};
					}}
				>
					<Button.Root type="submit" variant="outline" class="cursor-pointer">
						<RotateCcw class="w-4 h-4 mr-2" />
						Reset Demo Data
					</Button.Root>
				</form>
				<Button.Root class="cursor-pointer" onclick={() => goto('/modules/store/admin/new')}>
					<Plus class="w-4 h-4 mr-2" />
					Create your first product
				</Button.Root>
			</div>
		</div>
	{:else}
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head>Product</Table.Head>
					<Table.Head>Category</Table.Head>
					<Table.Head>Price</Table.Head>
					<Table.Head>Stock</Table.Head>
					<Table.Head>Status</Table.Head>
					<Table.Head>Updated</Table.Head>
					<Table.Head class="w-24"></Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each data.products as product}
					<Table.Row
						class="cursor-pointer"
						onclick={(e: MouseEvent) => {
							const target = e.target as HTMLElement;
							if (!target.closest('[data-action]')) {
								handleRowClick(product.id);
							}
						}}
					>
						<Table.Cell>
							<div class="flex items-center gap-2">
								<span class="font-medium">{product.name}</span>
								{#if product.featured}
									<Star class="w-4 h-4 text-amber-500 fill-amber-500" />
								{/if}
							</div>
						</Table.Cell>
						<Table.Cell class="text-zinc-500">
							{product.categoryName || '—'}
						</Table.Cell>
						<Table.Cell class="font-mono">
							${formatPrice(product.price)}
						</Table.Cell>
						<Table.Cell>
							{#if parseInt(product.inventory) <= 0}
								<span class="text-red-600 font-medium">Out of stock</span>
							{:else if parseInt(product.inventory) <= 10}
								<span class="text-amber-600">{product.inventory} left</span>
							{:else}
								<span class="text-zinc-600">{product.inventory}</span>
							{/if}
						</Table.Cell>
						<Table.Cell>
							{#if product.published}
								<span
									class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800"
								>
									<Eye class="w-3 h-3" />
									Published
								</span>
							{:else}
								<span
									class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-zinc-100 text-zinc-700"
								>
									<EyeOff class="w-3 h-3" />
									Draft
								</span>
							{/if}
						</Table.Cell>
						<Table.Cell class="text-zinc-500 text-sm">
							{formatDate(product.updatedAt)}
						</Table.Cell>
						<Table.Cell>
							<div class="flex items-center gap-2">
								<a
									href="/modules/store/admin/{product.id}/edit"
									data-action="edit"
									class="p-1.5 rounded text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200 transition-colors cursor-pointer"
									title="Edit product"
									onclick={(e: MouseEvent) => e.stopPropagation()}
								>
									<Pencil class="w-4 h-4" />
								</a>
								<button
									data-action="delete"
									class="p-1.5 rounded text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
									title="Delete product"
									onclick={(e: MouseEvent) => {
										e.stopPropagation();
										handleDelete(product.id, product.name);
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

<form
	method="POST"
	action="?/delete"
	use:enhance={() => {
		return async ({ result }) => {
			if (result.type === 'success') {
				toast.success('Product deleted successfully');
				window.location.reload();
			} else if (result.type === 'failure') {
				toast.error((result.data as { error?: string })?.error || 'Failed to delete product');
			}
		};
	}}
	class="hidden"
>
	<input type="hidden" name="productId" value="" />
</form>
