<script lang="ts">
	import { X, Minus, Plus, ShoppingBag, Trash2, ShoppingCart } from 'lucide-svelte';
	import { cart, cartItemCount, cartSubtotal, isCartOpen, closeCart } from '$lib/stores/cart';
	import { formatPrice } from '$lib/data/products';
	import { toast } from 'svelte-sonner';
	import { fly, fade } from 'svelte/transition';

	let isLoading = $state(false);

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			closeCart();
		}
	}

	function handleBackdropClick() {
		closeCart();
	}

	function incrementQuantity(productId: string, variantId: string, currentQty: number) {
		cart.updateQuantity(productId, variantId, currentQty + 1);
	}

	function decrementQuantity(productId: string, variantId: string, currentQty: number) {
		cart.updateQuantity(productId, variantId, currentQty - 1);
	}

	function removeItem(productId: string, variantId: string, name: string) {
		cart.removeItem(productId, variantId);
		toast.success(`${name} removed from cart`);
	}

	async function handleCheckout() {
		const items = cart.getItems();
		if (items.length === 0) {
			toast.error('Your cart is empty');
			return;
		}

		isLoading = true;
		try {
			const response = await fetch('/api/store/checkout', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					items: items.map((item) => ({
						productId: item.productId,
						variantId: item.variantId,
						quantity: item.quantity
					}))
				})
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || 'Failed to create checkout');
			}

			cart.clear();
			closeCart();
			window.location.href = result.url;
		} catch (err) {
			toast.error(err instanceof Error ? err.message : 'Failed to create checkout');
			isLoading = false;
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if $isCartOpen}
	<!-- Backdrop -->
	<button
		type="button"
		class="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 cursor-default"
		onclick={handleBackdropClick}
		aria-label="Close cart"
		transition:fade={{ duration: 200 }}
	></button>

	<!-- Drawer -->
	<div
		class="fixed right-0 top-0 h-full w-full max-w-[420px] bg-background shadow-2xl z-50 flex flex-col"
		role="dialog"
		aria-modal="true"
		aria-label="Shopping cart"
		transition:fly={{ x: 420, duration: 300, opacity: 1 }}
	>
		<!-- Header -->
		<div class="flex items-center justify-between px-6 py-5 border-b border-border">
			<div class="flex items-center gap-3">
				<div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
					<ShoppingCart class="w-5 h-5 text-primary" />
				</div>
				<div>
					<h2 class="text-lg font-semibold">Your Cart</h2>
					<p class="text-sm text-muted-foreground">{$cartItemCount} {$cartItemCount === 1 ? 'item' : 'items'}</p>
				</div>
			</div>
			<button
				type="button"
				onclick={closeCart}
				class="w-10 h-10 rounded-full hover:bg-muted transition-colors cursor-pointer flex items-center justify-center"
				aria-label="Close cart"
			>
				<X class="w-5 h-5 text-muted-foreground" />
			</button>
		</div>

		<!-- Cart Items -->
		<div class="flex-1 overflow-y-auto">
			{#if $cart.length === 0}
				<div class="flex flex-col items-center justify-center h-full text-center px-6">
					<div class="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
						<ShoppingBag class="w-10 h-10 text-muted-foreground/50" />
					</div>
					<h3 class="text-lg font-medium mb-1">Your cart is empty</h3>
					<p class="text-muted-foreground mb-6">Looks like you haven't added anything yet</p>
					<button
						type="button"
						onclick={closeCart}
						class="px-6 py-2.5 bg-primary text-primary-foreground font-medium rounded-full hover:bg-primary/90 transition-colors cursor-pointer"
					>
						Start Shopping
					</button>
				</div>
			{:else}
				<div class="px-6 py-4 space-y-4">
					{#each $cart as item (item.productId + '-' + item.variantId)}
						<div
							class="group relative bg-muted/50 rounded-2xl p-4 transition-all hover:shadow-lg"
						>
							<div class="flex gap-4">
								<!-- Product Image -->
								<div class="w-20 h-20 bg-background rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
									{#if item.image}
										<img
											src={item.image}
											alt={item.name}
											class="w-full h-full object-cover"
										/>
									{:else}
										<div class="w-full h-full flex items-center justify-center">
											<ShoppingBag class="w-8 h-8 text-muted-foreground/30" />
										</div>
									{/if}
								</div>

								<!-- Product Details -->
								<div class="flex-1 min-w-0 flex flex-col">
									<!-- Product Name -->
									<h3 class="font-semibold">
										<a
											href="/merch/{item.productId}"
											onclick={closeCart}
											class="text-primary hover:text-primary/80 transition-colors no-underline"
										>
											{item.name}
										</a>
									</h3>

									<!-- Color & Size -->
									<p class="text-sm text-muted-foreground mt-0.5">
										{item.color} · {item.size}
									</p>

									<!-- Price -->
									<div class="flex items-baseline gap-2 mt-1">
										<span class="text-base font-bold">
											{formatPrice(item.price * item.quantity)}
										</span>
										{#if item.quantity > 1}
											<span class="text-xs text-muted-foreground">
												({formatPrice(item.price)} each)
											</span>
										{/if}
									</div>

									<!-- Quantity Controls -->
									<div class="flex items-center justify-between mt-3">
										<div class="inline-flex items-center bg-background rounded-full shadow-sm border border-border">
											<button
												type="button"
												onclick={() => decrementQuantity(item.productId, item.variantId, item.quantity)}
												class="w-8 h-8 flex items-center justify-center hover:bg-muted rounded-l-full transition-colors cursor-pointer"
												aria-label="Decrease quantity"
											>
												<Minus class="w-3.5 h-3.5 text-muted-foreground" />
											</button>
											<span class="w-8 text-center text-sm font-semibold">
												{item.quantity}
											</span>
											<button
												type="button"
												onclick={() => incrementQuantity(item.productId, item.variantId, item.quantity)}
												class="w-8 h-8 flex items-center justify-center hover:bg-muted rounded-r-full transition-colors cursor-pointer"
												aria-label="Increase quantity"
											>
												<Plus class="w-3.5 h-3.5 text-muted-foreground" />
											</button>
										</div>

										<button
											type="button"
											onclick={() => removeItem(item.productId, item.variantId, item.name)}
											class="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-all cursor-pointer"
											aria-label="Remove item"
										>
											<Trash2 class="w-4 h-4" />
										</button>
									</div>
								</div>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Footer -->
		{#if $cart.length > 0}
			<div class="border-t border-border bg-muted/30 p-6 space-y-4">
				<!-- Order Summary -->
				<div class="space-y-2">
					<div class="flex justify-between text-sm">
						<span class="text-muted-foreground">Subtotal ({$cartItemCount} {$cartItemCount === 1 ? 'item' : 'items'})</span>
						<span class="font-medium">{formatPrice($cartSubtotal)}</span>
					</div>
					<div class="flex justify-between text-sm">
						<span class="text-muted-foreground">Shipping</span>
						<span class="text-muted-foreground">Calculated at checkout</span>
					</div>
					<div class="h-px bg-border my-2"></div>
					<div class="flex justify-between">
						<span class="font-semibold">Total</span>
						<span class="text-xl font-bold">{formatPrice($cartSubtotal)}</span>
					</div>
				</div>

				<!-- Checkout Button -->
				<button
					type="button"
					onclick={handleCheckout}
					disabled={isLoading}
					class="w-full py-4 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-lg"
				>
					{#if isLoading}
						<span class="flex items-center justify-center gap-2">
							<svg class="animate-spin w-5 h-5" viewBox="0 0 24 24">
								<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
								<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
							</svg>
							Processing...
						</span>
					{:else}
						Checkout · <span class="ml-2">{formatPrice($cartSubtotal)}</span>
					{/if}
				</button>

				<!-- Continue Shopping -->
				<button
					type="button"
					onclick={closeCart}
					class="w-full py-3 text-primary hover:text-primary/80 font-medium transition-colors cursor-pointer text-sm"
				>
					Continue Shopping
				</button>
			</div>
		{/if}
	</div>
{/if}
