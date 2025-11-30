<script lang="ts">
	import { ProductCard } from '$lib/components/ui';

	let { data } = $props();

	function isOutOfStock(inventory: string): boolean {
		return parseInt(inventory) <= 0;
	}

	function isOnSale(price: string, compareAtPrice: string | null): boolean {
		if (!compareAtPrice) return false;
		return parseInt(compareAtPrice) > parseInt(price);
	}
</script>

<svelte:head>
	<title>Store</title>
	<meta name="description" content="Browse our products" />
</svelte:head>

<div class="max-w-5xl mx-auto px-6 py-16">
	<div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
		<div>
			<h1 class="text-4xl font-semibold tracking-tight mb-2">Shop</h1>
			<p class="text-muted-foreground">Browse our collection of awesome products.</p>
		</div>

		{#if data.categories.length > 0}
			<div class="flex flex-wrap gap-2">
				<a
					href="/modules/store"
					class="px-3 py-1.5 rounded-full text-sm font-medium transition-colors {!data.selectedCategory
						? 'bg-foreground text-background'
						: 'bg-muted text-muted-foreground hover:bg-muted'}"
				>
					All
				</a>
				{#each data.categories as category}
					<a
						href="/modules/store?category={category.slug}"
						class="px-3 py-1.5 rounded-full text-sm font-medium transition-colors {data.selectedCategory ===
						category.slug
							? 'bg-foreground text-background'
							: 'bg-muted text-muted-foreground hover:bg-muted'}"
					>
						{category.name}
					</a>
				{/each}
			</div>
		{/if}
	</div>

	{#if data.products.length === 0}
		<div class="border border-border rounded-lg p-8 text-center bg-card">
			<p class="text-muted-foreground">
				No products yet. Go to the <a href="/modules/store/admin" class="underline">admin panel</a> and
				click "Reset Demo" to load sample products.
			</p>
		</div>
	{:else}
		<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
			{#each data.products as product}
				<ProductCard.Root href="/modules/store/{product.slug}">
					<div class="relative">
						<ProductCard.Image src={product.image} alt={product.name} />
						{#if isOutOfStock(product.inventory)}
							<ProductCard.Badge variant="out-of-stock">Out of Stock</ProductCard.Badge>
						{:else if isOnSale(product.price, product.compareAtPrice)}
							<ProductCard.Badge variant="sale">Sale</ProductCard.Badge>
						{:else if product.featured}
							<ProductCard.Badge variant="featured">Featured</ProductCard.Badge>
						{/if}
					</div>
					<ProductCard.Name>{product.name}</ProductCard.Name>
					<ProductCard.Price price={product.price} compareAtPrice={product.compareAtPrice} />
				</ProductCard.Root>
			{/each}
		</div>
	{/if}
</div>
