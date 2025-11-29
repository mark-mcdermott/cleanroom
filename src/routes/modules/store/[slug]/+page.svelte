<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button, ProductCard } from '$lib/components/ui';
	import { ShoppingCart, ArrowLeft, Minus, Plus } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	let { data } = $props();

	let quantity = $state(1);
	let isAdding = $state(false);

	function formatPrice(value: string): string {
		const num = parseFloat(value);
		return (num / 100).toFixed(2);
	}

	function isOutOfStock(inventory: string): boolean {
		return parseInt(inventory) <= 0;
	}

	function isOnSale(price: string, compareAtPrice: string | null): boolean {
		if (!compareAtPrice) return false;
		return parseInt(compareAtPrice) > parseInt(price);
	}

	const outOfStock = isOutOfStock(data.product.inventory);
	const onSale = isOnSale(data.product.price, data.product.compareAtPrice);
</script>

<svelte:head>
	<title>{data.product.name} - Store</title>
	<meta name="description" content={data.product.description || data.product.name} />
</svelte:head>

<div class="max-w-5xl mx-auto px-6 py-16">
	<a
		href="/modules/store"
		class="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 mb-8"
	>
		<ArrowLeft class="w-4 h-4" />
		Back to shop
	</a>

	<div class="grid md:grid-cols-2 gap-12">
		<!-- Product Image -->
		<div class="relative aspect-square rounded-xl overflow-hidden bg-zinc-100">
			{#if data.product.image}
				<img
					src={data.product.image}
					alt={data.product.name}
					class="w-full h-full object-cover"
				/>
			{:else}
				<div class="w-full h-full flex items-center justify-center">
					<span class="text-zinc-400 text-8xl">📦</span>
				</div>
			{/if}
			{#if outOfStock}
				<span
					class="absolute top-4 left-4 px-3 py-1.5 text-sm font-medium rounded bg-zinc-500 text-white"
				>
					Out of Stock
				</span>
			{:else if onSale}
				<span
					class="absolute top-4 left-4 px-3 py-1.5 text-sm font-medium rounded bg-red-500 text-white"
				>
					Sale
				</span>
			{/if}
		</div>

		<!-- Product Details -->
		<div>
			{#if data.categoryName}
				<p class="text-sm text-zinc-500 dark:text-zinc-400 mb-2">{data.categoryName}</p>
			{/if}

			<h1 class="text-3xl font-semibold tracking-tight mb-4">{data.product.name}</h1>

			<div class="flex items-center gap-3 mb-6">
				<span class="text-2xl font-bold {onSale ? 'text-red-600' : ''}">
					${formatPrice(data.product.price)}
				</span>
				{#if onSale && data.product.compareAtPrice}
					<span class="text-lg text-zinc-400 line-through">
						${formatPrice(data.product.compareAtPrice)}
					</span>
					<span class="px-2 py-0.5 text-sm font-medium bg-red-100 text-red-700 rounded">
						Save ${formatPrice((parseInt(data.product.compareAtPrice) - parseInt(data.product.price)).toString())}
					</span>
				{/if}
			</div>

			{#if data.product.description}
				<div class="prose prose-zinc mb-8">
					<p class="text-zinc-600 dark:text-zinc-400 leading-relaxed">{data.product.description}</p>
				</div>
			{/if}

			{#if !outOfStock}
				<form
					method="POST"
					action="?/addToCart"
					use:enhance={() => {
						isAdding = true;
						return async ({ result }) => {
							isAdding = false;
							if (result.type === 'success') {
								toast.success('Added to cart!');
							} else if (result.type === 'failure') {
								toast.error(
									(result.data as { error?: string })?.error || 'Failed to add to cart'
								);
							}
						};
					}}
				>
					<input type="hidden" name="productId" value={data.product.id} />
					<input type="hidden" name="quantity" value={quantity} />

					<div class="flex items-center gap-4 mb-6">
						<span class="text-sm font-medium">Quantity:</span>
						<div class="flex items-center gap-2">
							<button
								type="button"
								class="w-8 h-8 rounded border border-border flex items-center justify-center hover:bg-zinc-100 disabled:opacity-50 transition-colors"
								disabled={quantity <= 1}
								onclick={() => (quantity = Math.max(1, quantity - 1))}
							>
								<Minus class="w-4 h-4" />
							</button>
							<span class="w-12 text-center font-medium">{quantity}</span>
							<button
								type="button"
								class="w-8 h-8 rounded border border-border flex items-center justify-center hover:bg-zinc-100 disabled:opacity-50 transition-colors"
								disabled={quantity >= parseInt(data.product.inventory)}
								onclick={() =>
									(quantity = Math.min(parseInt(data.product.inventory), quantity + 1))}
							>
								<Plus class="w-4 h-4" />
							</button>
						</div>
						<span class="text-sm text-zinc-500 dark:text-zinc-400">
							{data.product.inventory} available
						</span>
					</div>

					<Button.Root type="submit" class="w-full cursor-pointer" disabled={isAdding}>
						<ShoppingCart class="w-4 h-4 mr-2" />
						{isAdding ? 'Adding...' : 'Add to Cart'}
					</Button.Root>
				</form>
			{:else}
				<Button.Root class="w-full" disabled>
					Out of Stock
				</Button.Root>
			{/if}

			<p class="text-xs text-zinc-400 mt-4">
				This is a demo store. No actual payment will be processed.
			</p>
		</div>
	</div>

	<!-- Related Products -->
	{#if data.relatedProducts.length > 0}
		<div class="mt-16 pt-16 border-t border-border">
			<h2 class="text-2xl font-semibold mb-8">Related Products</h2>
			<div class="grid grid-cols-2 md:grid-cols-3 gap-6">
				{#each data.relatedProducts as product}
					<ProductCard.Root href="/modules/store/{product.slug}">
						<div class="relative">
							<ProductCard.Image src={product.image} alt={product.name} />
							{#if isOutOfStock(product.inventory)}
								<ProductCard.Badge variant="out-of-stock">Out of Stock</ProductCard.Badge>
							{:else if isOnSale(product.price, product.compareAtPrice)}
								<ProductCard.Badge variant="sale">Sale</ProductCard.Badge>
							{/if}
						</div>
						<ProductCard.Name>{product.name}</ProductCard.Name>
						<ProductCard.Price price={product.price} compareAtPrice={product.compareAtPrice} />
					</ProductCard.Root>
				{/each}
			</div>
		</div>
	{/if}
</div>
