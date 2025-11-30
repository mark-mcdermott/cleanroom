import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { ProjectConfig, FeatureModule } from '../../types';

// Helper to determine if site uses SSR (database) or SSG
function isSSRSite(config: ProjectConfig): boolean {
	return config.siteType === 'ssr-site';
}

// ============================================================================
// DATABASE SCHEMA
// ============================================================================

function getStoreSchema(): string {
	return `// Product categories
export const categories = pgTable('categories', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	slug: text('slug').notNull().unique(),
	description: text('description'),
	image: text('image'),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

// Products
export const products = pgTable('products', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	slug: text('slug').notNull().unique(),
	description: text('description'),
	price: text('price').notNull(),
	compareAtPrice: text('compare_at_price'),
	image: text('image'),
	images: text('images'),
	categoryId: text('category_id').references(() => categories.id, { onDelete: 'set null' }),
	inventory: text('inventory').notNull().default('0'),
	published: boolean('published').notNull().default(true),
	featured: boolean('featured').notNull().default(false),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

// Shopping cart items
export const cartItems = pgTable('cart_items', {
	id: text('id').primaryKey(),
	sessionId: text('session_id').notNull(),
	productId: text('product_id')
		.notNull()
		.references(() => products.id, { onDelete: 'cascade' }),
	quantity: text('quantity').notNull().default('1'),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

// Orders
export const orders = pgTable('orders', {
	id: text('id').primaryKey(),
	sessionId: text('session_id').notNull(),
	email: text('email').notNull(),
	status: text('status').notNull().default('pending'),
	subtotal: text('subtotal').notNull(),
	tax: text('tax').notNull().default('0'),
	shipping: text('shipping').notNull().default('0'),
	total: text('total').notNull(),
	shippingAddress: text('shipping_address'),
	billingAddress: text('billing_address'),
	notes: text('notes'),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

// Order line items
export const orderItems = pgTable('order_items', {
	id: text('id').primaryKey(),
	orderId: text('order_id')
		.notNull()
		.references(() => orders.id, { onDelete: 'cascade' }),
	productId: text('product_id').references(() => products.id, { onDelete: 'set null' }),
	productName: text('product_name').notNull(),
	productImage: text('product_image'),
	price: text('price').notNull(),
	quantity: text('quantity').notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

// Store type exports
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type CartItem = typeof cartItems.$inferSelect;
export type NewCartItem = typeof cartItems.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;
`;
}

// ============================================================================
// SERVER LOAD FUNCTIONS
// ============================================================================

function getStoreListingServer(): string {
	return `import { createDb, products, categories } from '$lib/server/db';
import { desc, eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ platform, url }) => {
	const databaseUrl = platform?.env?.DATABASE_URL;

	if (!databaseUrl) {
		return { products: [], categories: [], selectedCategory: null };
	}

	const db = createDb(databaseUrl);
	const categorySlug = url.searchParams.get('category');

	const allCategories = await db
		.select({
			id: categories.id,
			name: categories.name,
			slug: categories.slug
		})
		.from(categories)
		.orderBy(categories.name);

	let allProducts = await db
		.select({
			id: products.id,
			name: products.name,
			slug: products.slug,
			price: products.price,
			compareAtPrice: products.compareAtPrice,
			image: products.image,
			categoryId: products.categoryId,
			inventory: products.inventory,
			featured: products.featured
		})
		.from(products)
		.where(eq(products.published, true))
		.orderBy(desc(products.featured), desc(products.createdAt));

	if (categorySlug) {
		const category = allCategories.find((c) => c.slug === categorySlug);
		if (category) {
			allProducts = allProducts.filter((p) => p.categoryId === category.id);
		}
	}

	return {
		products: allProducts,
		categories: allCategories,
		selectedCategory: categorySlug
	};
};
`;
}

function getProductDetailServer(): string {
	return `import { error, fail } from '@sveltejs/kit';
import { createDb, products, cartItems, categories } from '$lib/server/db';
import { eq, and } from 'drizzle-orm';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params, platform }) => {
	const databaseUrl = platform?.env?.DATABASE_URL;

	if (!databaseUrl) {
		error(500, 'Database not configured');
	}

	const db = createDb(databaseUrl);

	const [product] = await db
		.select()
		.from(products)
		.where(and(eq(products.slug, params.slug), eq(products.published, true)))
		.limit(1);

	if (!product) {
		error(404, 'Product not found');
	}

	let categoryName = null;
	if (product.categoryId) {
		const [category] = await db
			.select({ name: categories.name })
			.from(categories)
			.where(eq(categories.id, product.categoryId))
			.limit(1);
		categoryName = category?.name;
	}

	let relatedProducts: typeof product[] = [];
	if (product.categoryId) {
		relatedProducts = await db
			.select()
			.from(products)
			.where(
				and(
					eq(products.categoryId, product.categoryId),
					eq(products.published, true)
				)
			)
			.limit(4);
		relatedProducts = relatedProducts.filter((p) => p.id !== product.id).slice(0, 3);
	}

	return { product, categoryName, relatedProducts };
};

export const actions: Actions = {
	addToCart: async ({ request, platform, cookies }) => {
		const databaseUrl = platform?.env?.DATABASE_URL;
		if (!databaseUrl) {
			return fail(500, { error: 'Database not configured' });
		}

		const formData = await request.formData();
		const productId = formData.get('productId') as string;
		const quantity = parseInt(formData.get('quantity') as string) || 1;

		if (!productId) {
			return fail(400, { error: 'Product ID is required' });
		}

		let sessionId = cookies.get('store_session');
		if (!sessionId) {
			sessionId = crypto.randomUUID();
			cookies.set('store_session', sessionId, {
				path: '/',
				httpOnly: true,
				secure: true,
				sameSite: 'lax',
				maxAge: 60 * 60 * 24 * 30
			});
		}

		const db = createDb(databaseUrl);

		try {
			const [product] = await db
				.select()
				.from(products)
				.where(eq(products.id, productId))
				.limit(1);

			if (!product) {
				return fail(404, { error: 'Product not found' });
			}

			if (parseInt(product.inventory) <= 0) {
				return fail(400, { error: 'Product is out of stock' });
			}

			const [existingItem] = await db
				.select()
				.from(cartItems)
				.where(
					and(eq(cartItems.sessionId, sessionId), eq(cartItems.productId, productId))
				)
				.limit(1);

			if (existingItem) {
				const newQuantity = parseInt(existingItem.quantity) + quantity;
				await db
					.update(cartItems)
					.set({ quantity: newQuantity.toString(), updatedAt: new Date() })
					.where(eq(cartItems.id, existingItem.id));
			} else {
				await db.insert(cartItems).values({
					id: crypto.randomUUID(),
					sessionId,
					productId,
					quantity: quantity.toString()
				});
			}

			return { success: true, message: 'Added to cart' };
		} catch {
			return fail(500, { error: 'Failed to add to cart' });
		}
	}
};
`;
}

// ============================================================================
// SVELTE COMPONENTS
// ============================================================================

function getStoreListingSvelte(config: ProjectConfig): string {
	return `<script lang="ts">
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
	<title>Shop - ${config.projectName}</title>
	<meta name="description" content="Browse our products" />
</svelte:head>

<div class="max-w-5xl mx-auto px-6 py-16">
	<div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
		<div>
			<h1 class="text-4xl font-semibold tracking-tight mb-2">Shop</h1>
			<p class="text-muted-foreground">Browse our collection of products.</p>
		</div>

		{#if data.categories.length > 0}
			<div class="flex flex-wrap gap-2">
				<a
					href="/store"
					class="px-3 py-1.5 rounded-full text-sm font-medium transition-colors {!data.selectedCategory
						? 'bg-foreground text-background'
						: 'bg-muted text-muted-foreground hover:bg-accent'}"
				>
					All
				</a>
				{#each data.categories as category}
					<a
						href="/store?category={category.slug}"
						class="px-3 py-1.5 rounded-full text-sm font-medium transition-colors {data.selectedCategory ===
						category.slug
							? 'bg-foreground text-background'
							: 'bg-muted text-muted-foreground hover:bg-accent'}"
					>
						{category.name}
					</a>
				{/each}
			</div>
		{/if}
	</div>

	{#if data.products.length === 0}
		<div class="border border-border rounded-lg p-8 text-center bg-background">
			<p class="text-muted-foreground">No products available.</p>
		</div>
	{:else}
		<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
			{#each data.products as product}
				<ProductCard.Root href="/store/{product.slug}">
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
`;
}

function getProductDetailSvelte(config: ProjectConfig): string {
	return `<script lang="ts">
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
	<title>{data.product.name} - ${config.projectName}</title>
	<meta name="description" content={data.product.description || data.product.name} />
</svelte:head>

<div class="max-w-5xl mx-auto px-6 py-16">
	<a href="/store" class="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
		<ArrowLeft class="w-4 h-4" />
		Back to shop
	</a>

	<div class="grid md:grid-cols-2 gap-12">
		<div class="relative aspect-square rounded-xl overflow-hidden bg-muted">
			{#if data.product.image}
				<img src={data.product.image} alt={data.product.name} class="w-full h-full object-cover" />
			{:else}
				<div class="w-full h-full flex items-center justify-center">
					<span class="text-muted-foreground text-8xl">📦</span>
				</div>
			{/if}
		</div>

		<div>
			{#if data.categoryName}
				<p class="text-sm text-muted-foreground mb-2">{data.categoryName}</p>
			{/if}

			<h1 class="text-3xl font-semibold tracking-tight mb-4">{data.product.name}</h1>

			<div class="flex items-center gap-3 mb-6">
				<span class="text-2xl font-bold {onSale ? 'text-red-600' : ''}">
					\${formatPrice(data.product.price)}
				</span>
				{#if onSale && data.product.compareAtPrice}
					<span class="text-lg text-muted-foreground line-through">
						\${formatPrice(data.product.compareAtPrice)}
					</span>
				{/if}
			</div>

			{#if data.product.description}
				<p class="text-muted-foreground leading-relaxed mb-8">{data.product.description}</p>
			{/if}

			{#if !outOfStock}
				<form method="POST" action="?/addToCart" use:enhance={() => {
					isAdding = true;
					return async ({ result }) => {
						isAdding = false;
						if (result.type === 'success') {
							toast.success('Added to cart!');
						}
					};
				}}>
					<input type="hidden" name="productId" value={data.product.id} />
					<input type="hidden" name="quantity" value={quantity} />

					<div class="flex items-center gap-4 mb-6">
						<span class="text-sm font-medium">Quantity:</span>
						<div class="flex items-center gap-2">
							<button type="button" class="w-8 h-8 rounded border flex items-center justify-center" disabled={quantity <= 1} onclick={() => quantity = Math.max(1, quantity - 1)}>
								<Minus class="w-4 h-4" />
							</button>
							<span class="w-12 text-center font-medium">{quantity}</span>
							<button type="button" class="w-8 h-8 rounded border flex items-center justify-center" onclick={() => quantity++}>
								<Plus class="w-4 h-4" />
							</button>
						</div>
					</div>

					<Button.Root type="submit" class="w-full" disabled={isAdding}>
						<ShoppingCart class="w-4 h-4 mr-2" />
						{isAdding ? 'Adding...' : 'Add to Cart'}
					</Button.Root>
				</form>
			{:else}
				<Button.Root class="w-full" disabled>Out of Stock</Button.Root>
			{/if}
		</div>
	</div>
</div>
`;
}

// ============================================================================
// SEED SCRIPT
// ============================================================================

function getStoreSeedScript(): string {
	return `import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { categories, products } from './src/lib/server/db/schema';

if (!process.env.DATABASE_URL) {
	throw new Error('DATABASE_URL environment variable is required');
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

const sampleCategories = [
	{
		id: 'cat-tshirts',
		name: 'T-Shirts',
		slug: 't-shirts',
		description: 'Comfortable and stylish t-shirts'
	},
	{
		id: 'cat-hoodies',
		name: 'Hoodies',
		slug: 'hoodies',
		description: 'Cozy hoodies for any occasion'
	},
	{
		id: 'cat-accessories',
		name: 'Accessories',
		slug: 'accessories',
		description: 'Hats, bags, and more'
	}
];

const sampleProducts = [
	{
		id: 'prod-1',
		name: 'Classic Black Tee',
		slug: 'classic-black-tee',
		description: 'A timeless black t-shirt made from 100% organic cotton.',
		price: '2999',
		categoryId: 'cat-tshirts',
		inventory: '50',
		published: true,
		featured: true
	},
	{
		id: 'prod-2',
		name: 'Vintage White Tee',
		slug: 'vintage-white-tee',
		description: 'A soft, vintage-style white t-shirt.',
		price: '2499',
		compareAtPrice: '3499',
		categoryId: 'cat-tshirts',
		inventory: '25',
		published: true
	},
	{
		id: 'prod-3',
		name: 'Premium Zip Hoodie',
		slug: 'premium-zip-hoodie',
		description: 'A premium zip-up hoodie with soft fleece interior.',
		price: '6999',
		categoryId: 'cat-hoodies',
		inventory: '30',
		published: true,
		featured: true
	},
	{
		id: 'prod-4',
		name: 'Classic Snapback Cap',
		slug: 'classic-snapback-cap',
		description: 'Adjustable snapback cap with embroidered logo.',
		price: '2499',
		categoryId: 'cat-accessories',
		inventory: '100',
		published: true
	}
];

async function seed() {
	console.log('Seeding store data...');

	for (const cat of sampleCategories) {
		await db.insert(categories).values(cat).onConflictDoNothing();
		console.log(\`Created category: \${cat.name}\`);
	}

	for (const prod of sampleProducts) {
		await db.insert(products).values(prod).onConflictDoNothing();
		console.log(\`Created product: \${prod.name}\`);
	}

	console.log('Done!');
}

seed().catch(console.error);
`;
}

// ============================================================================
// PRODUCT CARD COMPONENT
// ============================================================================

function getProductCardComponent(): string {
	return `<script lang="ts">
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes } from 'svelte/elements';

	interface Props extends HTMLAnchorAttributes {
		class?: string;
		children?: Snippet;
	}

	let { class: className, children, href, ...restProps }: Props = $props();
</script>

<a
	{href}
	data-slot="product-card"
	class={cn('group block', className)}
	{...restProps}
>
	{#if children}
		{@render children()}
	{/if}
</a>
`;
}

function getProductCardImageComponent(): string {
	return `<script lang="ts">
	import { cn } from '$lib/utils';
	import type { HTMLImgAttributes } from 'svelte/elements';

	interface Props extends HTMLImgAttributes {
		class?: string;
	}

	let { class: className, src, alt, ...restProps }: Props = $props();
</script>

{#if src}
	<div class={cn('relative aspect-square overflow-hidden rounded-lg bg-muted mb-3', className)}>
		<img
			{src}
			{alt}
			data-slot="product-card-image"
			class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
			{...restProps}
		/>
	</div>
{:else}
	<div class={cn('relative aspect-square overflow-hidden rounded-lg bg-muted mb-3 flex items-center justify-center', className)}>
		<span class="text-muted-foreground text-4xl">📦</span>
	</div>
{/if}
`;
}

function getProductCardNameComponent(): string {
	return `<script lang="ts">
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLHeadingElement> {
		class?: string;
		children?: Snippet;
	}

	let { class: className, children, ...restProps }: Props = $props();
</script>

<h3
	data-slot="product-card-name"
	class={cn('font-medium text-foreground group-hover:text-muted-foreground transition-colors line-clamp-2', className)}
	{...restProps}
>
	{#if children}
		{@render children()}
	{/if}
</h3>
`;
}

function getProductCardPriceComponent(): string {
	return `<script lang="ts">
	import { cn } from '$lib/utils';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		class?: string;
		price: string | number;
		compareAtPrice?: string | number | null;
		currency?: string;
	}

	let { class: className, price, compareAtPrice, currency = '$', ...restProps }: Props = $props();

	function formatPrice(value: string | number): string {
		const num = typeof value === 'string' ? parseFloat(value) : value;
		return (num / 100).toFixed(2);
	}

	const hasDiscount = compareAtPrice && Number(compareAtPrice) > Number(price);
</script>

<div data-slot="product-card-price" class={cn('flex items-center gap-2 mt-1', className)} {...restProps}>
	<span class={cn('font-semibold', hasDiscount ? 'text-red-600' : 'text-foreground')}>
		{currency}{formatPrice(price)}
	</span>
	{#if hasDiscount}
		<span class="text-muted-foreground line-through text-sm">
			{currency}{formatPrice(compareAtPrice)}
		</span>
	{/if}
</div>
`;
}

function getProductCardBadgeComponent(): string {
	return `<script lang="ts">
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLSpanElement> {
		class?: string;
		variant?: 'sale' | 'new' | 'featured' | 'out-of-stock';
		children?: Snippet;
	}

	let { class: className, variant = 'new', children, ...restProps }: Props = $props();

	const variantClasses = {
		sale: 'bg-red-500 text-white',
		new: 'bg-emerald-500 text-white',
		featured: 'bg-amber-500 text-white',
		'out-of-stock': 'bg-muted text-white'
	};
</script>

<span
	data-slot="product-card-badge"
	class={cn('absolute top-2 left-2 px-2 py-1 text-xs font-medium rounded', variantClasses[variant], className)}
	{...restProps}
>
	{#if children}
		{@render children()}
	{/if}
</span>
`;
}

function getProductCardIndex(): string {
	return `import Root from './ProductCard.svelte';
import Image from './ProductCardImage.svelte';
import Name from './ProductCardName.svelte';
import Price from './ProductCardPrice.svelte';
import Badge from './ProductCardBadge.svelte';

export {
	Root,
	Image,
	Name,
	Price,
	Badge,
	Root as ProductCard,
	Image as ProductCardImage,
	Name as ProductCardName,
	Price as ProductCardPrice,
	Badge as ProductCardBadge
};
`;
}

// ============================================================================
// MAIN MODULE EXPORT
// ============================================================================

export const storeModule: FeatureModule = {
	name: 'store',
	async apply(config: ProjectConfig, outputDir: string) {
		const useDatabase = isSSRSite(config);

		if (!useDatabase) {
			console.log('  → Store module requires SSR site type with database support');
			console.log('  → Skipping store module for static sites');
			return;
		}

		console.log('  → Generating e-commerce store module');

		// Create directory structure
		await mkdir(join(outputDir, 'src', 'routes', 'store', '[slug]'), { recursive: true });
		await mkdir(join(outputDir, 'src', 'routes', 'store', 'cart'), { recursive: true });
		await mkdir(join(outputDir, 'src', 'routes', 'store', 'checkout'), { recursive: true });
		await mkdir(join(outputDir, 'src', 'lib', 'components', 'ui', 'product-card'), { recursive: true });
		await mkdir(join(outputDir, 'scripts'), { recursive: true });

		// Check if db schema already exists
		const schemaPath = join(outputDir, 'src', 'lib', 'server', 'db', 'schema.ts');
		let existingSchema = '';
		try {
			existingSchema = await readFile(schemaPath, 'utf-8');
		} catch {
			await mkdir(join(outputDir, 'src', 'lib', 'server', 'db'), { recursive: true });
		}

		// Append store schema
		if (existingSchema) {
			let updatedSchema = existingSchema;
			if (!existingSchema.includes('boolean')) {
				updatedSchema = existingSchema.replace(
					"import { pgTable, text, timestamp }",
					"import { pgTable, text, timestamp, boolean }"
				);
			}
			await writeFile(schemaPath, updatedSchema + '\n' + getStoreSchema());
		} else {
			const baseSchema = `import { pgTable, text, timestamp, boolean } from 'drizzle-orm/pg-core';

${getStoreSchema()}`;
			await writeFile(schemaPath, baseSchema);
		}

		// Write store routes
		await writeFile(join(outputDir, 'src', 'routes', 'store', '+page.server.ts'), getStoreListingServer());
		await writeFile(join(outputDir, 'src', 'routes', 'store', '+page.svelte'), getStoreListingSvelte(config));
		await writeFile(join(outputDir, 'src', 'routes', 'store', '[slug]', '+page.server.ts'), getProductDetailServer());
		await writeFile(join(outputDir, 'src', 'routes', 'store', '[slug]', '+page.svelte'), getProductDetailSvelte(config));

		// Write ProductCard components
		await writeFile(join(outputDir, 'src', 'lib', 'components', 'ui', 'product-card', 'ProductCard.svelte'), getProductCardComponent());
		await writeFile(join(outputDir, 'src', 'lib', 'components', 'ui', 'product-card', 'ProductCardImage.svelte'), getProductCardImageComponent());
		await writeFile(join(outputDir, 'src', 'lib', 'components', 'ui', 'product-card', 'ProductCardName.svelte'), getProductCardNameComponent());
		await writeFile(join(outputDir, 'src', 'lib', 'components', 'ui', 'product-card', 'ProductCardPrice.svelte'), getProductCardPriceComponent());
		await writeFile(join(outputDir, 'src', 'lib', 'components', 'ui', 'product-card', 'ProductCardBadge.svelte'), getProductCardBadgeComponent());
		await writeFile(join(outputDir, 'src', 'lib', 'components', 'ui', 'product-card', 'index.ts'), getProductCardIndex());

		// Write seed script
		await writeFile(join(outputDir, 'scripts', 'seed-store.ts'), getStoreSeedScript());

		// Update package.json
		const packageJsonPath = join(outputDir, 'package.json');
		const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf-8'));

		packageJson.dependencies = {
			...packageJson.dependencies,
			'drizzle-orm': '^0.38.3',
			'@neondatabase/serverless': '^0.10.4'
		};

		packageJson.devDependencies = {
			...packageJson.devDependencies,
			'drizzle-kit': '^0.30.1',
			'dotenv': '^16.4.7'
		};

		packageJson.scripts = {
			...packageJson.scripts,
			'db:generate': 'drizzle-kit generate',
			'db:push': 'drizzle-kit push',
			'db:studio': 'drizzle-kit studio',
			'db:seed-store': 'npx tsx scripts/seed-store.ts'
		};

		await writeFile(packageJsonPath, JSON.stringify(packageJson, null, '\t'));

		console.log('  → Store module created successfully');
		console.log('  → Run "pnpm db:push" to create tables');
		console.log('  → Run "pnpm db:seed-store" to add sample products');
	}
};
