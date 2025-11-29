<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { Button, CartItem } from '$lib/components/ui';
	import { ShoppingBag, Trash2, ArrowLeft } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	let { data } = $props();

	function formatPrice(value: number | string): string {
		const num = typeof value === 'string' ? parseFloat(value) : value;
		return (num / 100).toFixed(2);
	}
</script>

<svelte:head>
	<title>Shopping Cart - Store</title>
	<meta name="description" content="Your shopping cart" />
</svelte:head>

<div class="max-w-3xl mx-auto px-6 py-16">
	<div class="flex items-center justify-between mb-8">
		<div>
			<h1 class="text-3xl font-semibold tracking-tight">Shopping Cart</h1>
			<p class="text-zinc-600 mt-1">
				{data.items.length}
				{data.items.length === 1 ? 'item' : 'items'}
			</p>
		</div>
		{#if data.items.length > 0}
			<form
				method="POST"
				action="?/clearCart"
				use:enhance={() => {
					return async ({ result }) => {
						if (result.type === 'success') {
							toast.success('Cart cleared');
						}
					};
				}}
			>
				<Button.Root type="submit" variant="outline" size="sm" class="cursor-pointer">
					<Trash2 class="w-4 h-4 mr-2" />
					Clear Cart
				</Button.Root>
			</form>
		{/if}
	</div>

	{#if data.items.length === 0}
		<div class="border border-zinc-200 rounded-lg p-12 text-center bg-white">
			<ShoppingBag class="w-12 h-12 mx-auto text-zinc-300 mb-4" />
			<p class="text-zinc-600 mb-4">Your cart is empty</p>
			<Button.Root onclick={() => goto('/modules/store')} class="cursor-pointer">
				Continue Shopping
			</Button.Root>
		</div>
	{:else}
		<div class="bg-white border border-zinc-200 rounded-lg divide-y divide-zinc-200">
			{#each data.items as item}
				<div class="p-4">
					<CartItem.Root>
						<a href="/modules/store/{item.productSlug}" class="flex-shrink-0">
							<CartItem.Image src={item.productImage} alt={item.productName} />
						</a>
						<CartItem.Details>
							<a href="/modules/store/{item.productSlug}" class="hover:underline">
								<CartItem.Name>{item.productName}</CartItem.Name>
							</a>
							<p class="text-sm text-zinc-500 mt-1">
								${formatPrice(item.productPrice || '0')} each
							</p>
							<div class="flex items-center gap-4 mt-3">
								<form
									method="POST"
									action="?/updateQuantity"
									use:enhance={() => {
										return async ({ result }) => {
											if (result.type === 'failure') {
												toast.error('Failed to update quantity');
											}
										};
									}}
									class="contents"
								>
									<input type="hidden" name="itemId" value={item.id} />
									<CartItem.Quantity
										quantity={parseInt(item.quantity)}
										max={parseInt(item.productInventory || '99')}
										onIncrement={() => {
											const form = document.createElement('form');
											form.method = 'POST';
											form.action = '?/updateQuantity';
											form.innerHTML = `
												<input type="hidden" name="itemId" value="${item.id}" />
												<input type="hidden" name="quantity" value="${parseInt(item.quantity) + 1}" />
											`;
											document.body.appendChild(form);
											form.requestSubmit();
											document.body.removeChild(form);
										}}
										onDecrement={() => {
											const form = document.createElement('form');
											form.method = 'POST';
											form.action = '?/updateQuantity';
											form.innerHTML = `
												<input type="hidden" name="itemId" value="${item.id}" />
												<input type="hidden" name="quantity" value="${parseInt(item.quantity) - 1}" />
											`;
											document.body.appendChild(form);
											form.requestSubmit();
											document.body.removeChild(form);
										}}
									/>
								</form>
								<form
									method="POST"
									action="?/removeItem"
									use:enhance={() => {
										return async ({ result }) => {
											if (result.type === 'success') {
												toast.success('Item removed');
											}
										};
									}}
								>
									<input type="hidden" name="itemId" value={item.id} />
									<button
										type="submit"
										class="text-sm text-zinc-400 hover:text-red-600 transition-colors cursor-pointer"
									>
										Remove
									</button>
								</form>
							</div>
						</CartItem.Details>
						<div class="text-right">
							<CartItem.Price
								price={item.productPrice || '0'}
								quantity={parseInt(item.quantity)}
							/>
						</div>
					</CartItem.Root>
				</div>
			{/each}
		</div>

		<!-- Order Summary -->
		<div class="mt-8 bg-zinc-50 border border-zinc-200 rounded-lg p-6">
			<h2 class="text-lg font-semibold mb-4">Order Summary</h2>
			<div class="space-y-2 text-sm">
				<div class="flex justify-between">
					<span class="text-zinc-600">Subtotal</span>
					<span>${formatPrice(data.subtotal)}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-zinc-600">Shipping</span>
					<span class="text-zinc-500">Calculated at checkout</span>
				</div>
				<div class="flex justify-between">
					<span class="text-zinc-600">Tax</span>
					<span class="text-zinc-500">Calculated at checkout</span>
				</div>
			</div>
			<div class="border-t border-zinc-200 mt-4 pt-4">
				<div class="flex justify-between text-lg font-semibold">
					<span>Estimated Total</span>
					<span>${formatPrice(data.subtotal)}</span>
				</div>
			</div>
			<Button.Root
				class="w-full mt-6 cursor-pointer"
				onclick={() => goto('/modules/store/checkout')}
			>
				Proceed to Checkout
			</Button.Root>
			<p class="text-xs text-zinc-400 text-center mt-3">
				This is a demo store. No actual payment will be processed.
			</p>
		</div>

		<a
			href="/modules/store"
			class="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-700 mt-6"
		>
			<ArrowLeft class="w-4 h-4" />
			Continue Shopping
		</a>
	{/if}
</div>
