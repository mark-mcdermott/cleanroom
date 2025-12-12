import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { ProjectConfig, FeatureModule } from '../../types';

// ============================================================================
// MERCH PRODUCTS DATA FILE (static product definitions)
// ============================================================================

function getMerchProductsData(config: ProjectConfig): string {
	return `// Product and variant types for the merch store
// Products are defined statically with Printful sync variant IDs

export interface MerchVariant {
	id: string;
	size: string;
	color: string;
	colorHex: string;
	printfulSyncVariantId: string; // Printful's sync variant ID for ordering
	inStock: boolean;
}

export interface MerchProduct {
	id: string;
	slug: string;
	name: string;
	description: string;
	price: number; // in cents
	images: string[];
	category: 'tshirt' | 'hoodie' | 'mug' | 'sticker' | 'other';
	variants: MerchVariant[];
}

// Define your merch products here
// After setting up Printful sync products, add your printfulSyncVariantId values
export const merchProducts: MerchProduct[] = [
	{
		id: 'logo-tee',
		slug: 'logo-tee',
		name: 'Logo T-Shirt',
		description: 'A comfortable t-shirt featuring our logo. Perfect for everyday wear.',
		price: 2500, // $25.00
		images: ['/merch/logo-tee.png'],
		category: 'tshirt',
		variants: [
			// Add your Printful sync variant IDs here
			{ id: 'logo-tee-s-white', size: 'S', color: 'White', colorHex: '#ffffff', printfulSyncVariantId: '', inStock: true },
			{ id: 'logo-tee-m-white', size: 'M', color: 'White', colorHex: '#ffffff', printfulSyncVariantId: '', inStock: true },
			{ id: 'logo-tee-l-white', size: 'L', color: 'White', colorHex: '#ffffff', printfulSyncVariantId: '', inStock: true },
			{ id: 'logo-tee-xl-white', size: 'XL', color: 'White', colorHex: '#ffffff', printfulSyncVariantId: '', inStock: true },
			{ id: 'logo-tee-s-black', size: 'S', color: 'Black', colorHex: '#1a1a1a', printfulSyncVariantId: '', inStock: true },
			{ id: 'logo-tee-m-black', size: 'M', color: 'Black', colorHex: '#1a1a1a', printfulSyncVariantId: '', inStock: true },
			{ id: 'logo-tee-l-black', size: 'L', color: 'Black', colorHex: '#1a1a1a', printfulSyncVariantId: '', inStock: true },
			{ id: 'logo-tee-xl-black', size: 'XL', color: 'Black', colorHex: '#1a1a1a', printfulSyncVariantId: '', inStock: true },
		]
	},
	{
		id: 'logo-hoodie',
		slug: 'logo-hoodie',
		name: 'Logo Hoodie',
		description: 'A cozy hoodie featuring our logo. Perfect for cooler weather.',
		price: 4500, // $45.00
		images: ['/merch/logo-hoodie.png'],
		category: 'hoodie',
		variants: [
			{ id: 'logo-hoodie-s-white', size: 'S', color: 'White', colorHex: '#ffffff', printfulSyncVariantId: '', inStock: true },
			{ id: 'logo-hoodie-m-white', size: 'M', color: 'White', colorHex: '#ffffff', printfulSyncVariantId: '', inStock: true },
			{ id: 'logo-hoodie-l-white', size: 'L', color: 'White', colorHex: '#ffffff', printfulSyncVariantId: '', inStock: true },
			{ id: 'logo-hoodie-xl-white', size: 'XL', color: 'White', colorHex: '#ffffff', printfulSyncVariantId: '', inStock: true },
		]
	}
];

// Helper functions
export function getMerchProduct(slug: string): MerchProduct | undefined {
	return merchProducts.find(p => p.slug === slug);
}

export function getMerchProductById(id: string): MerchProduct | undefined {
	return merchProducts.find(p => p.id === id);
}

export function getMerchProductVariant(productId: string, variantId: string): MerchVariant | undefined {
	const product = merchProducts.find(p => p.id === productId);
	return product?.variants.find(v => v.id === variantId);
}

export function getMerchAvailableSizes(product: MerchProduct): string[] {
	return [...new Set(product.variants.filter(v => v.inStock).map(v => v.size))];
}

export function getMerchAvailableColors(product: MerchProduct): { color: string; hex: string }[] {
	const colors = new Map<string, string>();
	product.variants
		.filter(v => v.inStock)
		.forEach(v => colors.set(v.color, v.colorHex));
	return Array.from(colors.entries()).map(([color, hex]) => ({ color, hex }));
}

export function getMerchVariantByOptions(product: MerchProduct, size: string, color: string): MerchVariant | undefined {
	return product.variants.find(v => v.size === size && v.color === color && v.inStock);
}

export function formatMerchPrice(cents: number): string {
	return \`$\${(cents / 100).toFixed(2)}\`;
}
`;
}

// ============================================================================
// MERCH LISTING PAGE
// ============================================================================

function getMerchListingPage(config: ProjectConfig): string {
	return `<script lang="ts">
	import { Card } from '$lib/components/ui';
	import { merchProducts, formatMerchPrice } from '$lib/data/merch';
	import { ShoppingBag } from 'lucide-svelte';
</script>

<svelte:head>
	<title>Merch - ${config.projectName}</title>
	<meta name="description" content="Browse our merchandise" />
</svelte:head>

<div class="max-w-6xl mx-auto px-6 py-16">
	<div class="text-center mb-12">
		<h1 class="text-4xl sm:text-5xl font-bold mb-4">Merch</h1>
		<p class="text-lg text-muted-foreground max-w-2xl mx-auto">
			Rep us with our premium merch. All items are printed on-demand and shipped directly to you.
		</p>
	</div>

	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
		{#each merchProducts as product}
			<a href="/merch/{product.slug}" class="group no-underline">
				<Card.Root class="overflow-hidden hover:shadow-lg transition-shadow">
					<div class="aspect-square bg-muted flex items-center justify-center">
						{#if product.images[0]}
							<img
								src={product.images[0]}
								alt={product.name}
								class="w-full h-full object-cover"
								onerror={(e) => {
									const img = e.currentTarget as HTMLImageElement;
									img.style.display = 'none';
									const next = img.nextElementSibling as HTMLElement;
									if (next) next.style.display = 'flex';
								}}
							/>
							<div class="hidden w-full h-full items-center justify-center">
								<ShoppingBag class="w-16 h-16 text-muted-foreground/30" />
							</div>
						{:else}
							<ShoppingBag class="w-16 h-16 text-muted-foreground/30" />
						{/if}
					</div>
					<div class="p-6">
						<h2 class="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
							{product.name}
						</h2>
						<p class="text-muted-foreground text-sm mb-4 line-clamp-2">
							{product.description}
						</p>
						<div class="flex items-center justify-between">
							<span class="text-lg font-bold">{formatMerchPrice(product.price)}</span>
							<span class="text-sm text-muted-foreground">
								{product.variants.filter(v => v.inStock).length} options
							</span>
						</div>
					</div>
				</Card.Root>
			</a>
		{/each}
	</div>

	{#if merchProducts.length === 0}
		<div class="text-center py-16">
			<ShoppingBag class="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
			<h2 class="text-xl font-semibold mb-2">Coming Soon</h2>
			<p class="text-muted-foreground">Our merch store is being set up. Check back soon!</p>
		</div>
	{/if}
</div>

<style>
	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
`;
}

// ============================================================================
// MERCH PRODUCT DETAIL PAGE SERVER
// ============================================================================

function getMerchProductDetailServer(): string {
	return `import { error } from '@sveltejs/kit';
import { getMerchProduct } from '$lib/data/merch';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const product = getMerchProduct(params.slug);

	if (!product) {
		error(404, 'Product not found');
	}

	return { product };
};
`;
}

// ============================================================================
// MERCH PRODUCT DETAIL PAGE
// ============================================================================

function getMerchProductDetailPage(config: ProjectConfig): string {
	return `<script lang="ts">
	import { Button, Card } from '$lib/components/ui';
	import { getMerchAvailableSizes, getMerchAvailableColors, getMerchVariantByOptions, formatMerchPrice } from '$lib/data/merch';
	import { ShoppingBag, ArrowLeft, Check } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	let { data } = $props();
	const product = data.product;

	const sizes = getMerchAvailableSizes(product);
	const colors = getMerchAvailableColors(product);

	let selectedSize = $state(sizes[0] || '');
	let selectedColor = $state(colors[0]?.color || '');
	let isLoading = $state(false);

	const selectedVariant = $derived(getMerchVariantByOptions(product, selectedSize, selectedColor));

	async function handleCheckout() {
		if (!selectedVariant) {
			toast.error('Please select a size and color');
			return;
		}

		isLoading = true;
		try {
			const response = await fetch('/api/merch/checkout', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					productId: product.id,
					variantId: selectedVariant.id,
					quantity: 1
				})
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || 'Failed to create checkout');
			}

			// Redirect to Stripe checkout
			window.location.href = result.url;
		} catch (err) {
			toast.error(err instanceof Error ? err.message : 'Failed to create checkout');
			isLoading = false;
		}
	}
</script>

<svelte:head>
	<title>{product.name} - ${config.projectName} Merch</title>
	<meta name="description" content={product.description} />
</svelte:head>

<div class="max-w-6xl mx-auto px-6 py-8">
	<a href="/merch" class="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 no-underline">
		<ArrowLeft class="w-4 h-4" />
		Back to Merch
	</a>

	<div class="grid md:grid-cols-2 gap-12">
		<!-- Product Image -->
		<div class="aspect-square bg-muted rounded-2xl flex items-center justify-center overflow-hidden">
			{#if product.images[0]}
				<img
					src={product.images[0]}
					alt={product.name}
					class="w-full h-full object-cover"
					onerror={(e) => {
						const img = e.currentTarget as HTMLImageElement;
						img.style.display = 'none';
						const next = img.nextElementSibling as HTMLElement;
						if (next) next.style.display = 'flex';
					}}
				/>
				<div class="hidden w-full h-full items-center justify-center">
					<ShoppingBag class="w-24 h-24 text-muted-foreground/30" />
				</div>
			{:else}
				<ShoppingBag class="w-24 h-24 text-muted-foreground/30" />
			{/if}
		</div>

		<!-- Product Info -->
		<div>
			<h1 class="text-3xl sm:text-4xl font-bold mb-4">{product.name}</h1>
			<p class="text-2xl font-bold mb-6">{formatMerchPrice(product.price)}</p>
			<p class="text-muted-foreground mb-8">{product.description}</p>

			<!-- Color Selector -->
			{#if colors.length > 1}
				<div class="mb-6">
					<label class="block text-sm font-medium mb-3">Color: {selectedColor}</label>
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
				<label class="block text-sm font-medium mb-3">Size</label>
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

			<!-- Buy Button -->
			<Button.Root
				onclick={handleCheckout}
				disabled={!selectedVariant || isLoading}
				class="w-full py-6 text-lg"
			>
				{#if isLoading}
					Processing...
				{:else}
					Buy Now - {formatMerchPrice(product.price)}
				{/if}
			</Button.Root>

			<p class="text-sm text-muted-foreground mt-4 text-center">
				Shipping calculated at checkout. Printed and shipped by Printful.
			</p>

			<!-- Product Details -->
			<Card.Root class="mt-8 p-6">
				<h3 class="font-semibold mb-3">Product Details</h3>
				<ul class="text-sm text-muted-foreground space-y-2">
					<li>100% ring-spun cotton</li>
					<li>Pre-shrunk fabric</li>
					<li>Side-seamed construction</li>
					<li>Shoulder-to-shoulder taping</li>
					<li>Printed on demand - ships in 2-5 business days</li>
				</ul>
			</Card.Root>
		</div>
	</div>
</div>
`;
}

// ============================================================================
// MERCH CHECKOUT API ENDPOINT
// ============================================================================

function getMerchCheckoutApi(): string {
	return `import { json, error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { createStripe, generateId } from '$lib/server/stripe';
import { createDb, orders } from '$lib/server/db';
import { getMerchProductById, getMerchProductVariant } from '$lib/data/merch';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals, platform, url }) => {
	const stripeSecretKey = platform?.env?.STRIPE_SECRET_KEY;
	const databaseUrl = platform?.env?.DATABASE_URL;

	if (!stripeSecretKey || !databaseUrl) {
		error(500, 'Stripe not configured');
	}

	const body = await request.json();
	const { productId, variantId, quantity = 1 } = body;

	if (!productId || !variantId) {
		error(400, 'Product and variant are required');
	}

	// Validate product and variant
	const product = getMerchProductById(productId);
	if (!product) {
		error(404, 'Product not found');
	}

	const variant = getMerchProductVariant(productId, variantId);
	if (!variant || !variant.inStock) {
		error(400, 'Variant not available');
	}

	const stripe = createStripe(stripeSecretKey);
	const db = createDb(databaseUrl);

	// Create order in database
	const orderId = generateId();
	const subtotal = product.price * quantity;
	const shipping = 0; // Will be calculated by Stripe shipping options
	const total = subtotal + shipping;

	const orderItems = [
		{
			productId: product.id,
			variantId: variant.id,
			printfulSyncVariantId: variant.printfulSyncVariantId,
			name: product.name,
			size: variant.size,
			color: variant.color,
			quantity,
			price: product.price
		}
	];

	await db.insert(orders).values({
		id: orderId,
		email: locals.user?.email || '',
		userId: locals.user?.id || null,
		status: 'pending',
		items: orderItems,
		subtotal,
		shipping,
		total
	});

	// Create Stripe checkout session with shipping address collection
	const session = await stripe.checkout.sessions.create({
		payment_method_types: ['card'],
		line_items: [
			{
				price_data: {
					currency: 'usd',
					product_data: {
						name: \`\${product.name} - \${variant.color} / \${variant.size}\`,
						description: product.description,
						...(product.images[0]?.startsWith('http') ? { images: [product.images[0]] } : {})
					},
					unit_amount: product.price
				},
				quantity
			}
		],
		mode: 'payment',
		shipping_address_collection: {
			allowed_countries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'ES', 'IT', 'NL', 'BE', 'AT', 'CH', 'SE', 'NO', 'DK', 'FI', 'IE', 'PT', 'PL', 'CZ']
		},
		shipping_options: [
			{
				shipping_rate_data: {
					type: 'fixed_amount',
					fixed_amount: { amount: 500, currency: 'usd' },
					display_name: 'Standard Shipping',
					delivery_estimate: {
						minimum: { unit: 'business_day', value: 5 },
						maximum: { unit: 'business_day', value: 10 }
					}
				}
			},
			{
				shipping_rate_data: {
					type: 'fixed_amount',
					fixed_amount: { amount: 1500, currency: 'usd' },
					display_name: 'Express Shipping',
					delivery_estimate: {
						minimum: { unit: 'business_day', value: 2 },
						maximum: { unit: 'business_day', value: 5 }
					}
				}
			}
		],
		success_url: \`\${url.origin}/merch/order-confirmation?session_id={CHECKOUT_SESSION_ID}\`,
		cancel_url: \`\${url.origin}/merch/\${product.slug}?cancelled=true\`,
		metadata: {
			orderId,
			type: 'merch_order'
		},
		customer_email: locals.user?.email || undefined
	});

	// Update order with Stripe session ID
	await db
		.update(orders)
		.set({ stripeSessionId: session.id })
		.where(eq(orders.id, orderId));

	return json({ url: session.url });
};
`;
}

// ============================================================================
// MERCH ORDER CONFIRMATION PAGE SERVER
// ============================================================================

function getMerchOrderConfirmationServer(): string {
	return `import { error, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { createStripe } from '$lib/server/stripe';
import { createDb, orders } from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, platform }) => {
	const sessionId = url.searchParams.get('session_id');

	if (!sessionId) {
		redirect(302, '/merch');
	}

	const stripeSecretKey = platform?.env?.STRIPE_SECRET_KEY;
	const databaseUrl = platform?.env?.DATABASE_URL;

	if (!stripeSecretKey || !databaseUrl) {
		error(500, 'Configuration error');
	}

	const stripe = createStripe(stripeSecretKey);
	const db = createDb(databaseUrl);

	try {
		const session = await stripe.checkout.sessions.retrieve(sessionId, {
			expand: ['line_items']
		});

		if (session.payment_status !== 'paid') {
			redirect(302, '/merch?error=payment_incomplete');
		}

		const orderId = session.metadata?.orderId;
		let order = null;

		if (orderId) {
			const [dbOrder] = await db
				.select()
				.from(orders)
				.where(eq(orders.id, orderId))
				.limit(1);
			order = dbOrder;
		}

		return {
			orderNumber: orderId || session.id.slice(-8).toUpperCase(),
			email: session.customer_details?.email || session.customer_email || '',
			total: session.amount_total ? session.amount_total / 100 : 0,
			shippingAddress: session.shipping_details?.address
				? {
						name: session.shipping_details.name,
						line1: session.shipping_details.address.line1,
						line2: session.shipping_details.address.line2,
						city: session.shipping_details.address.city,
						state: session.shipping_details.address.state,
						postalCode: session.shipping_details.address.postal_code,
						country: session.shipping_details.address.country
					}
				: null,
			items: order?.items || []
		};
	} catch (err) {
		console.error('Error retrieving order:', err);
		redirect(302, '/merch?error=order_not_found');
	}
};
`;
}

// ============================================================================
// MERCH ORDER CONFIRMATION PAGE
// ============================================================================

function getMerchOrderConfirmationPage(config: ProjectConfig): string {
	return `<script lang="ts">
	import { Card } from '$lib/components/ui';
	import { CheckCircle, Package, Mail, MapPin, ArrowLeft } from 'lucide-svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Order Confirmed - ${config.projectName} Merch</title>
</svelte:head>

<div class="max-w-2xl mx-auto px-6 py-16">
	<div class="text-center mb-8">
		<div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
			<CheckCircle class="w-8 h-8 text-green-600 dark:text-green-400" />
		</div>
		<h1 class="text-3xl font-bold mb-2">Order Confirmed!</h1>
		<p class="text-muted-foreground">
			Thank you for your purchase. Your order is being processed.
		</p>
	</div>

	<Card.Root class="p-6 mb-6">
		<div class="flex items-center justify-between mb-4">
			<span class="text-sm text-muted-foreground">Order Number</span>
			<span class="font-mono font-semibold">{data.orderNumber}</span>
		</div>
		<div class="flex items-center justify-between">
			<span class="text-sm text-muted-foreground">Total</span>
			<span class="text-xl font-bold">\${data.total.toFixed(2)}</span>
		</div>
	</Card.Root>

	<div class="grid gap-6 md:grid-cols-2">
		<Card.Root class="p-6">
			<div class="flex items-center gap-2 mb-4">
				<Mail class="w-4 h-4 text-muted-foreground" />
				<h2 class="font-semibold">Confirmation Email</h2>
			</div>
			<p class="text-sm text-muted-foreground">
				A confirmation email has been sent to:
			</p>
			<p class="font-medium mt-1">{data.email}</p>
		</Card.Root>

		{#if data.shippingAddress}
			<Card.Root class="p-6">
				<div class="flex items-center gap-2 mb-4">
					<MapPin class="w-4 h-4 text-muted-foreground" />
					<h2 class="font-semibold">Shipping Address</h2>
				</div>
				<div class="text-sm">
					<p class="font-medium">{data.shippingAddress.name}</p>
					<p class="text-muted-foreground">{data.shippingAddress.line1}</p>
					{#if data.shippingAddress.line2}
						<p class="text-muted-foreground">{data.shippingAddress.line2}</p>
					{/if}
					<p class="text-muted-foreground">
						{data.shippingAddress.city}, {data.shippingAddress.state} {data.shippingAddress.postalCode}
					</p>
					<p class="text-muted-foreground">{data.shippingAddress.country}</p>
				</div>
			</Card.Root>
		{/if}
	</div>

	{#if data.items && data.items.length > 0}
		<Card.Root class="p-6 mt-6">
			<div class="flex items-center gap-2 mb-4">
				<Package class="w-4 h-4 text-muted-foreground" />
				<h2 class="font-semibold">Order Items</h2>
			</div>
			<ul class="divide-y">
				{#each data.items as item}
					<li class="py-3 flex justify-between">
						<div>
							<p class="font-medium">{item.name}</p>
							<p class="text-sm text-muted-foreground">
								{item.color} / {item.size} × {item.quantity}
							</p>
						</div>
						<p class="font-medium">\${(item.price * item.quantity / 100).toFixed(2)}</p>
					</li>
				{/each}
			</ul>
		</Card.Root>
	{/if}

	<div class="mt-8 p-6 bg-muted/50 rounded-lg">
		<h3 class="font-semibold mb-2">What's Next?</h3>
		<ul class="text-sm text-muted-foreground space-y-2">
			<li>• Your order will be printed and shipped within 2-5 business days</li>
			<li>• You'll receive a tracking number via email once shipped</li>
			<li>• Estimated delivery: 5-10 business days after shipping</li>
		</ul>
	</div>

	<div class="text-center mt-8">
		<a href="/merch" class="inline-flex items-center gap-2 text-primary hover:underline">
			<ArrowLeft class="w-4 h-4" />
			Continue Shopping
		</a>
	</div>
</div>
`;
}

// ============================================================================
// NAV LINK INJECTION
// ============================================================================

function injectMerchNavLink(layoutContent: string): string {
	// Skip if merch link already exists
	if (layoutContent.includes("'/merch'") || layoutContent.includes('"/merch"')) {
		return layoutContent;
	}

	// Look for navLinks array definition and add merch link
	// Match the closing of the navLinks array and insert merch before it
	if (layoutContent.includes('const navLinks')) {
		// Find the navLinks array and add merch link before the closing ];
		// Match pattern like: { href: '/contact', label: 'Contact' }\n\t];
		layoutContent = layoutContent.replace(
			/(\{\s*href:\s*'\/contact',\s*label:\s*'Contact'\s*\})([\s\n\t]*\];)/,
			`$1,\n\t\t{ href: '/merch', label: 'Merch' }$2`
		);

		// Also try matching after hideWhenAuth links (for auth-enabled sites)
		layoutContent = layoutContent.replace(
			/(hideWhenAuth:\s*true[^}]*\})([\s\n\t]*\];)/,
			`$1,\n\t\t{ href: '/merch', label: 'Merch' }$2`
		);
	}

	// Pattern 2: Look for inline nav links in HTML and add merch
	if (layoutContent.includes('<nav') && layoutContent.includes('href="/"')) {
		const navLinkPattern = /(<a\s+href="\/[^"]*"[^>]*>[^<]*<\/a>)(\s*)(<!--\s*(Auth|User|Login|Desktop Auth))/i;
		if (navLinkPattern.test(layoutContent)) {
			layoutContent = layoutContent.replace(
				navLinkPattern,
				`$1\n\t\t\t\t<a href="/merch" class="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Merch</a>$2$3`
			);
		}
	}

	return layoutContent;
}

// ============================================================================
// MAIN MODULE EXPORT
// ============================================================================

export const merchModule: FeatureModule = {
	name: 'merch',
	async apply(config: ProjectConfig, outputDir: string) {
		if (config.siteType !== 'ssr-site') {
			console.log('  → Merch add-on requires SSR site type');
			console.log('  → Skipping merch add-on for static sites');
			return;
		}

		console.log('  → Generating merch add-on (Stripe + Printful)');

		// Create directory structure
		await mkdir(join(outputDir, 'src', 'lib', 'data'), { recursive: true });
		await mkdir(join(outputDir, 'src', 'lib', 'server'), { recursive: true });
		await mkdir(join(outputDir, 'src', 'routes', 'merch', '[slug]'), { recursive: true });
		await mkdir(join(outputDir, 'src', 'routes', 'merch', 'order-confirmation'), { recursive: true });
		await mkdir(join(outputDir, 'src', 'routes', 'api', 'merch', 'checkout'), { recursive: true });
		await mkdir(join(outputDir, 'static', 'merch'), { recursive: true });

		// Write merch products data
		await writeFile(join(outputDir, 'src', 'lib', 'data', 'merch.ts'), getMerchProductsData(config));

		// Check if stripe.ts and printful.ts exist (may be created by store module)
		const stripePath = join(outputDir, 'src', 'lib', 'server', 'stripe.ts');
		const printfulPath = join(outputDir, 'src', 'lib', 'server', 'printful.ts');

		try {
			await readFile(stripePath, 'utf-8');
		} catch {
			// Create stripe helper if not present
			await writeFile(stripePath, `import Stripe from 'stripe';

export function createStripe(secretKey: string) {
	return new Stripe(secretKey, {
		apiVersion: '2024-11-20.acacia'
	});
}

export function generateId(): string {
	return crypto.randomUUID();
}
`);
		}

		try {
			await readFile(printfulPath, 'utf-8');
		} catch {
			// Create printful client if not present
			await writeFile(printfulPath, `// Printful API integration
interface PrintfulRecipient {
	name: string;
	address1: string;
	address2?: string;
	city: string;
	state_code?: string;
	country_code: string;
	zip: string;
	email: string;
}

interface PrintfulOrderItem {
	sync_variant_id: string;
	quantity: number;
}

interface PrintfulOrder {
	id: number;
	external_id: string;
	status: string;
}

export class PrintfulClient {
	private apiKey: string;
	private baseUrl = 'https://api.printful.com';

	constructor(apiKey: string) {
		this.apiKey = apiKey;
	}

	private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
		const response = await fetch(\`\${this.baseUrl}\${endpoint}\`, {
			...options,
			headers: {
				Authorization: \`Bearer \${this.apiKey}\`,
				'Content-Type': 'application/json',
				...options.headers
			}
		});
		const data = await response.json();
		if (!response.ok) throw new Error(data.error?.message || \`Printful API error: \${response.status}\`);
		return data.result;
	}

	async createOrder(orderId: string, recipient: PrintfulRecipient, items: PrintfulOrderItem[], retailCosts?: { subtotal: number; shipping: number; total: number }): Promise<PrintfulOrder> {
		const orderData: Record<string, unknown> = { external_id: orderId, recipient, items };
		if (retailCosts) {
			orderData.retail_costs = {
				subtotal: (retailCosts.subtotal / 100).toFixed(2),
				shipping: (retailCosts.shipping / 100).toFixed(2),
				total: (retailCosts.total / 100).toFixed(2)
			};
		}
		return this.request<PrintfulOrder>('/orders', { method: 'POST', body: JSON.stringify(orderData) });
	}

	async confirmOrder(orderId: number): Promise<PrintfulOrder> {
		return this.request<PrintfulOrder>(\`/orders/\${orderId}/confirm\`, { method: 'POST' });
	}
}

export function createPrintfulClient(apiKey: string): PrintfulClient {
	return new PrintfulClient(apiKey);
}
`);
		}

		// Check if orders schema exists, if not add it
		const schemaPath = join(outputDir, 'src', 'lib', 'server', 'db', 'schema.ts');
		try {
			let existingSchema = await readFile(schemaPath, 'utf-8');

			// Add jsonb and integer imports if not present
			if (!existingSchema.includes('jsonb') || !existingSchema.includes('integer')) {
				existingSchema = existingSchema.replace(
					/import \{([^}]+)\} from 'drizzle-orm\/pg-core'/,
					(match, imports) => {
						const currentImports = imports.split(',').map((s: string) => s.trim());
						if (!currentImports.includes('jsonb')) currentImports.push('jsonb');
						if (!currentImports.includes('integer')) currentImports.push('integer');
						return `import { ${currentImports.join(', ')} } from 'drizzle-orm/pg-core'`;
					}
				);
			}

			// Only add orders schema if not already present
			if (!existingSchema.includes("export const orders")) {
				const ordersSchema = `
// Store/Merch orders
export const orders = pgTable('orders', {
	id: text('id').primaryKey(),
	email: text('email').notNull(),
	userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
	stripeSessionId: text('stripe_session_id'),
	stripePaymentIntentId: text('stripe_payment_intent_id'),
	printfulOrderId: text('printful_order_id'),
	status: text('status').notNull().default('pending'),
	shippingAddress: jsonb('shipping_address'),
	items: jsonb('items').notNull(),
	subtotal: integer('subtotal').notNull(),
	shipping: integer('shipping').notNull().default(0),
	total: integer('total').notNull(),
	trackingNumber: text('tracking_number'),
	trackingUrl: text('tracking_url'),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
`;
				await writeFile(schemaPath, existingSchema + '\n' + ordersSchema);
			}
			// Update db index to export orders
			const dbIndexPath = join(outputDir, 'src', 'lib', 'server', 'db', 'index.ts');
			try {
				let dbIndex = await readFile(dbIndexPath, 'utf-8');
				if (!dbIndex.includes('orders')) {
					// Handle both "export * from './schema'" and "export { ... } from './schema'" patterns
					if (dbIndex.includes("export * from './schema'")) {
						// Already exports everything, no change needed
					} else if (dbIndex.includes("export {")) {
						dbIndex = dbIndex.replace(
							/export \{([^}]*)\} from ['"]\.\/schema['"]/,
							(match, exports) => {
								const currentExports = exports.split(',').map((s: string) => s.trim()).filter(Boolean);
								if (!currentExports.includes('orders')) {
									currentExports.push('orders');
								}
								return `export { ${currentExports.join(', ')} } from './schema'`;
							}
						);
						await writeFile(dbIndexPath, dbIndex);
					}
				}
			} catch {
				// db/index.ts doesn't exist or can't be read
			}
		} catch {
			console.log('  → Note: Orders schema requires auth module to be installed first');
		}

		// Write merch routes
		await writeFile(join(outputDir, 'src', 'routes', 'merch', '+page.svelte'), getMerchListingPage(config));
		await writeFile(join(outputDir, 'src', 'routes', 'merch', '[slug]', '+page.server.ts'), getMerchProductDetailServer());
		await writeFile(join(outputDir, 'src', 'routes', 'merch', '[slug]', '+page.svelte'), getMerchProductDetailPage(config));
		await writeFile(join(outputDir, 'src', 'routes', 'merch', 'order-confirmation', '+page.server.ts'), getMerchOrderConfirmationServer());
		await writeFile(join(outputDir, 'src', 'routes', 'merch', 'order-confirmation', '+page.svelte'), getMerchOrderConfirmationPage(config));

		// Write API route
		await writeFile(join(outputDir, 'src', 'routes', 'api', 'merch', 'checkout', '+server.ts'), getMerchCheckoutApi());

		// Add merch nav link to layout
		const layoutFiles = [
			join(outputDir, 'src', 'routes', '+layout.svelte'),
			join(outputDir, 'src', 'routes', '(app)', '+layout.svelte')
		];

		for (const layoutPath of layoutFiles) {
			try {
				let layoutContent = await readFile(layoutPath, 'utf-8');
				const updatedLayout = injectMerchNavLink(layoutContent);
				if (updatedLayout !== layoutContent) {
					await writeFile(layoutPath, updatedLayout);
					console.log(`  → Added merch nav link to layout`);
				}
			} catch {
				// Layout file doesn't exist, skip
			}
		}

		// Update .env.example
		const envExamplePath = join(outputDir, '.env.example');
		try {
			let envExample = await readFile(envExamplePath, 'utf-8');
			if (!envExample.includes('STRIPE_SECRET_KEY')) {
				envExample += `
# Stripe configuration
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Printful configuration (optional - for automatic order fulfillment)
PRINTFUL_API_KEY=...
`;
				await writeFile(envExamplePath, envExample);
			}
		} catch {
			await writeFile(envExamplePath, `# Stripe configuration
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Printful configuration (optional)
PRINTFUL_API_KEY=...
`);
		}

		// Update package.json
		const packageJsonPath = join(outputDir, 'package.json');
		const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf-8'));

		packageJson.dependencies = {
			...packageJson.dependencies,
			'stripe': '^17.4.0',
			'svelte-sonner': '^0.3.28'
		};

		await writeFile(packageJsonPath, JSON.stringify(packageJson, null, '\t'));

		console.log('  → Merch add-on created successfully');
		console.log('  → Pages: /merch, /merch/[slug], /merch/order-confirmation');
		console.log('  → API: /api/merch/checkout');
		console.log('  → Configure STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET in .env');
		console.log('  → Edit src/lib/data/merch.ts to add your products');
	}
};
