<script lang="ts">
	import { Card } from '$lib/components/ui';
	import { getAvailableSizes, getAvailableColors, getVariantByOptions, formatPrice, getProductImage } from '$lib/data/products';
	import { ShoppingBag, ArrowLeft, Check } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { cart, openCart } from '$lib/stores/cart';

	let { data } = $props();
	const product = data.product;

	const sizes = getAvailableSizes(product);
	const colors = getAvailableColors(product);

	let selectedSize = $state(sizes.includes('M') ? 'M' : sizes[0] || '');
	let selectedColor = $state(colors[0]?.color || '');
	let showBack = $state(false);

	const selectedVariant = $derived(getVariantByOptions(product, selectedSize, selectedColor));
	const currentImage = $derived(getProductImage(product, selectedColor, showBack ? 'back' : 'front'));

	function handleAddToCart() {
		if (!selectedVariant) {
			toast.error('Please select a size and color');
			return;
		}

		const image = getProductImage(product, selectedColor, 'front');

		cart.addItem({
			productId: product.id,
			variantId: selectedVariant.id,
			name: product.name,
			size: selectedVariant.size,
			color: selectedVariant.color,
			price: product.price,
			image
		});

		toast.success(`${product.name} added to cart`);
		openCart();
	}
</script>

<svelte:head>
	<title>{product.name} - Cleanroom Merch</title>
	<meta name="description" content={product.description} />
</svelte:head>

<div class="max-w-6xl mx-auto px-6 py-8">
	<a href="/merch" class="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 no-underline">
		<ArrowLeft class="w-4 h-4" />
		Back to Merch
	</a>

	<div class="grid md:grid-cols-2 gap-12">
		<!-- Product Image -->
		<div class="space-y-4">
			<button
				type="button"
				onclick={() => showBack = !showBack}
				class="aspect-square w-full bg-muted rounded-2xl flex items-center justify-center overflow-hidden cursor-pointer relative group"
			>
				{#if currentImage}
					<img
						src={currentImage}
						alt="{product.name} - {showBack ? 'Back' : 'Front'}"
						class="w-full h-full object-cover transition-opacity"
					/>
					<div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
						<span class="opacity-0 group-hover:opacity-100 text-white text-sm font-medium bg-black/50 px-3 py-1 rounded-full transition-opacity">
							Click to see {showBack ? 'front' : 'back'}
						</span>
					</div>
				{:else}
					<ShoppingBag class="w-24 h-24 text-muted-foreground/30" />
				{/if}
			</button>
			<p class="text-center text-sm text-muted-foreground">Click image to toggle front/back view</p>
		</div>

		<!-- Product Info -->
		<div>
			<h1 class="text-3xl sm:text-4xl font-bold mb-4">{product.name}</h1>
			<p class="text-2xl font-bold mb-6">{formatPrice(product.price)}</p>
			<p class="text-muted-foreground mb-8">{product.description}</p>

			<!-- Color Selector -->
			{#if colors.length > 1}
				<div class="mb-6">
					<span class="block text-sm font-medium mb-3">Color: {selectedColor}</span>
					<div class="flex gap-3">
						{#each colors as { color, hex }}
							<button
								type="button"
								onclick={() => selectedColor = color}
								class="w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center cursor-pointer"
								style="background-color: {hex}; border-color: {selectedColor === color ? 'var(--app-primary)' : 'transparent'};"
								title={color}
							>
								{#if selectedColor === color}
									<Check class="w-5 h-5" style="color: {hex === '#ffffff' || hex === '#fff' ? '#000' : '#fff'}" />
								{/if}
							</button>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Size Selector -->
			<div class="mb-8">
				<span class="block text-sm font-medium mb-3">Size</span>
				<div class="flex flex-wrap gap-3">
					{#each sizes as size}
						<button
							type="button"
							onclick={() => selectedSize = size}
							class="px-4 py-2 border rounded-lg transition-all cursor-pointer {selectedSize === size ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:border-foreground/50'}"
						>
							{size}
						</button>
					{/each}
				</div>
			</div>

			<!-- Add to Cart Button -->
			<button
				onclick={handleAddToCart}
				disabled={!selectedVariant}
				class="w-full py-4 text-lg font-semibold rounded-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg"
			>
				Add to Cart · <span class="ml-2">{formatPrice(product.price)}</span>
			</button>

			<p class="text-sm text-muted-foreground mt-4 text-center">
				Shipping calculated at checkout. Printed and shipped by Printful.
			</p>

			<!-- Product Details -->
			<Card.Root class="mt-8 p-6">
				<h3 class="font-semibold mb-3">Product Details</h3>
				<ul class="text-sm text-muted-foreground space-y-2">
					{#if product.category === 'hoodie'}
						<li>80% ring-spun cotton, 20% polyester</li>
						<li>Soft fleece interior</li>
						<li>Full-length zipper</li>
						<li>Front pockets</li>
					{:else if product.category === 'tshirt'}
						<li>100% ring-spun cotton</li>
						<li>Pre-shrunk fabric</li>
						<li>Side-seamed construction</li>
						<li>Shoulder-to-shoulder taping</li>
					{:else}
						<li>Premium quality materials</li>
					{/if}
					<li>Printed on demand - ships in 2-5 business days</li>
				</ul>
			</Card.Root>
		</div>
	</div>
</div>
