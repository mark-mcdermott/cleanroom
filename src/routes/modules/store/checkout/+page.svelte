<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { Button, Input, Label } from '$lib/components/ui';
	import { Check, ArrowLeft, Loader2 } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	let { data } = $props();

	let isSubmitting = $state(false);
	let orderComplete = $state(false);
	let orderId = $state('');

	function formatPrice(value: number | string): string {
		const num = typeof value === 'string' ? parseFloat(value) : value;
		return (num / 100).toFixed(2);
	}
</script>

<svelte:head>
	<title>Checkout - Store</title>
	<meta name="description" content="Complete your order" />
</svelte:head>

<div class="max-w-5xl mx-auto px-6 py-16">
	{#if orderComplete}
		<!-- Order Success -->
		<div class="max-w-md mx-auto text-center">
			<div
				class="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6"
			>
				<Check class="w-8 h-8 text-emerald-600" />
			</div>
			<h1 class="text-3xl font-semibold tracking-tight mb-4">Order Placed!</h1>
			<p class="text-muted-foreground mb-2">
				Thank you for your demo order. Your order number is:
			</p>
			<p class="font-mono text-sm bg-muted px-4 py-2 rounded mb-6">{orderId}</p>
			<p class="text-sm text-muted-foreground mb-8">
				This is a demo store, so no actual payment was processed and no products will be shipped.
			</p>
			<Button.Root onclick={() => goto('/modules/store')} class="cursor-pointer">
				Continue Shopping
			</Button.Root>
		</div>
	{:else}
		<a
			href="/modules/store/cart"
			class="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
		>
			<ArrowLeft class="w-4 h-4" />
			Back to cart
		</a>

		<h1 class="text-3xl font-semibold tracking-tight mb-8">Checkout</h1>

		<div class="grid lg:grid-cols-5 gap-12">
			<!-- Checkout Form -->
			<div class="lg:col-span-3">
				<form
					method="POST"
					action="?/placeOrder"
					use:enhance={() => {
						isSubmitting = true;
						return async ({ result }) => {
							isSubmitting = false;
							if (result.type === 'success' && result.data) {
								orderId = (result.data as { orderId?: string }).orderId || '';
								orderComplete = true;
							} else if (result.type === 'failure') {
								toast.error(
									(result.data as { error?: string })?.error || 'Failed to place order'
								);
							}
						};
					}}
					class="space-y-8"
				>
					<!-- Contact Info -->
					<div>
						<h2 class="text-lg font-semibold mb-4">Contact Information</h2>
						<div class="space-y-4">
							<div>
								<Label.Root for="email">Email</Label.Root>
								<Input.Root
									type="email"
									id="email"
									name="email"
									placeholder="you@example.com"
									required
									class="mt-1.5"
								/>
							</div>
						</div>
					</div>

					<!-- Shipping Address -->
					<div>
						<h2 class="text-lg font-semibold mb-4">Shipping Address</h2>
						<div class="grid grid-cols-2 gap-4">
							<div>
								<Label.Root for="firstName">First Name</Label.Root>
								<Input.Root
									type="text"
									id="firstName"
									name="firstName"
									placeholder="John"
									required
									class="mt-1.5"
								/>
							</div>
							<div>
								<Label.Root for="lastName">Last Name</Label.Root>
								<Input.Root
									type="text"
									id="lastName"
									name="lastName"
									placeholder="Doe"
									required
									class="mt-1.5"
								/>
							</div>
							<div class="col-span-2">
								<Label.Root for="address">Address</Label.Root>
								<Input.Root
									type="text"
									id="address"
									name="address"
									placeholder="123 Main St"
									required
									class="mt-1.5"
								/>
							</div>
							<div class="col-span-2 md:col-span-1">
								<Label.Root for="city">City</Label.Root>
								<Input.Root
									type="text"
									id="city"
									name="city"
									placeholder="San Francisco"
									required
									class="mt-1.5"
								/>
							</div>
							<div>
								<Label.Root for="state">State</Label.Root>
								<Input.Root
									type="text"
									id="state"
									name="state"
									placeholder="CA"
									required
									class="mt-1.5"
								/>
							</div>
							<div>
								<Label.Root for="zip">ZIP Code</Label.Root>
								<Input.Root
									type="text"
									id="zip"
									name="zip"
									placeholder="94102"
									required
									class="mt-1.5"
								/>
							</div>
						</div>
					</div>

					<!-- Payment (Demo) -->
					<div>
						<h2 class="text-lg font-semibold mb-4">Payment</h2>
						<div class="bg-amber-50 border border-amber-200 rounded-lg p-4">
							<p class="text-sm text-amber-800">
								This is a demo store. No payment information is required or collected. Click "Place
								Order" to simulate a purchase.
							</p>
						</div>
					</div>

					<Button.Root
						type="submit"
						class="w-full cursor-pointer"
						disabled={isSubmitting}
					>
						{#if isSubmitting}
							<Loader2 class="w-4 h-4 mr-2 animate-spin" />
							Processing...
						{:else}
							Place Order - ${formatPrice(data.total)}
						{/if}
					</Button.Root>
				</form>
			</div>

			<!-- Order Summary -->
			<div class="lg:col-span-2">
				<div class="bg-muted border border-border rounded-lg p-6 sticky top-6">
					<h2 class="text-lg font-semibold mb-4">Order Summary</h2>

					<div class="space-y-4 mb-6">
						{#each data.items as item}
							<div class="flex gap-3">
								<div
									class="w-16 h-16 rounded bg-muted flex-shrink-0 overflow-hidden"
								>
									{#if item.productImage}
										<img
											src={item.productImage}
											alt={item.productName}
											class="w-full h-full object-cover"
										/>
									{:else}
										<div class="w-full h-full flex items-center justify-center">
											<span class="text-muted-foreground">📦</span>
										</div>
									{/if}
								</div>
								<div class="flex-1 min-w-0">
									<p class="font-medium text-sm truncate">{item.productName}</p>
									<p class="text-xs text-muted-foreground">Qty: {item.quantity}</p>
								</div>
								<div class="text-sm font-medium">
									${formatPrice(
										parseInt(item.productPrice || '0') * parseInt(item.quantity)
									)}
								</div>
							</div>
						{/each}
					</div>

					<div class="border-t border-border pt-4 space-y-2 text-sm">
						<div class="flex justify-between">
							<span class="text-muted-foreground">Subtotal</span>
							<span>${formatPrice(data.subtotal)}</span>
						</div>
						<div class="flex justify-between">
							<span class="text-muted-foreground">Shipping</span>
							<span>
								{#if data.shipping === 0}
									<span class="text-emerald-600">Free</span>
								{:else}
									${formatPrice(data.shipping)}
								{/if}
							</span>
						</div>
						<div class="flex justify-between">
							<span class="text-muted-foreground">Tax (8%)</span>
							<span>${formatPrice(data.tax)}</span>
						</div>
					</div>

					<div class="border-t border-border mt-4 pt-4">
						<div class="flex justify-between text-lg font-semibold">
							<span>Total</span>
							<span>${formatPrice(data.total)}</span>
						</div>
					</div>

					{#if data.subtotal < 5000}
						<p class="text-xs text-muted-foreground mt-4">
							Add ${formatPrice(5000 - data.subtotal)} more for free shipping!
						</p>
					{/if}
				</div>
			</div>
		</div>
	{/if}
</div>
