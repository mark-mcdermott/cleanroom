import { error, fail } from '@sveltejs/kit';
import { createDb, demoProducts, demoCartItems, demoCategories } from '$lib/server/db';
import { eq, and } from 'drizzle-orm';
import type { PageServerLoad, Actions } from './$types';

export const prerender = false;

export const load: PageServerLoad = async ({ params, platform, cookies }) => {
	const databaseUrl = platform?.env?.DATABASE_URL;

	if (!databaseUrl) {
		error(500, 'Database not configured');
	}

	const db = createDb(databaseUrl);

	const [product] = await db
		.select()
		.from(demoProducts)
		.where(and(eq(demoProducts.slug, params.slug), eq(demoProducts.published, true)))
		.limit(1);

	if (!product) {
		error(404, 'Product not found');
	}

	// Get category name if exists
	let categoryName = null;
	if (product.categoryId) {
		const [category] = await db
			.select({ name: demoCategories.name })
			.from(demoCategories)
			.where(eq(demoCategories.id, product.categoryId))
			.limit(1);
		categoryName = category?.name;
	}

	// Get related products from same category
	let relatedProducts: typeof product[] = [];
	if (product.categoryId) {
		relatedProducts = await db
			.select()
			.from(demoProducts)
			.where(
				and(
					eq(demoProducts.categoryId, product.categoryId),
					eq(demoProducts.published, true)
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

		// Get or create session ID
		let sessionId = cookies.get('store_session');
		if (!sessionId) {
			sessionId = crypto.randomUUID();
			cookies.set('store_session', sessionId, {
				path: '/',
				httpOnly: true,
				secure: true,
				sameSite: 'lax',
				maxAge: 60 * 60 * 24 * 30 // 30 days
			});
		}

		const db = createDb(databaseUrl);

		try {
			// Check if product exists and has inventory
			const [product] = await db
				.select()
				.from(demoProducts)
				.where(eq(demoProducts.id, productId))
				.limit(1);

			if (!product) {
				return fail(404, { error: 'Product not found' });
			}

			if (parseInt(product.inventory) <= 0) {
				return fail(400, { error: 'Product is out of stock' });
			}

			// Check if item already in cart
			const [existingItem] = await db
				.select()
				.from(demoCartItems)
				.where(
					and(eq(demoCartItems.sessionId, sessionId), eq(demoCartItems.productId, productId))
				)
				.limit(1);

			if (existingItem) {
				// Update quantity
				const newQuantity = parseInt(existingItem.quantity) + quantity;
				await db
					.update(demoCartItems)
					.set({ quantity: newQuantity.toString(), updatedAt: new Date() })
					.where(eq(demoCartItems.id, existingItem.id));
			} else {
				// Add new item
				await db.insert(demoCartItems).values({
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
