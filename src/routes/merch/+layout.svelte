<script lang="ts">
	import { ShoppingCart } from 'lucide-svelte';
	import { cartItemCount, openCart } from '$lib/stores/cart';
	import CartDrawer from '$lib/components/CartDrawer.svelte';

	let { children } = $props();
</script>

<!-- Floating Cart Button -->
<button
	type="button"
	onclick={openCart}
	class="fixed top-20 right-4 z-30 flex items-center gap-2 px-4 py-2 bg-background rounded-full shadow-lg border border-border hover:bg-muted transition-colors cursor-pointer"
	aria-label="Open shopping cart"
>
	<ShoppingCart class="w-5 h-5 text-muted-foreground" />
	<span class="text-sm font-medium">Cart</span>
	{#if $cartItemCount > 0}
		<span class="w-5 h-5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center">
			{$cartItemCount > 9 ? '9+' : $cartItemCount}
		</span>
	{/if}
</button>

<CartDrawer />

{@render children()}
