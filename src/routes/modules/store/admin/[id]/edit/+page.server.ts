import { error, fail, redirect } from '@sveltejs/kit';
import { createDb, demoProducts, demoCategories } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import type { PageServerLoad, Actions } from './$types';

export const prerender = false;

export const load: PageServerLoad = async ({ params, platform }) => {
	const databaseUrl = platform?.env?.DATABASE_URL;
	if (!databaseUrl) {
		error(500, 'Database not configured');
	}

	const db = createDb(databaseUrl);

	const [product] = await db
		.select()
		.from(demoProducts)
		.where(eq(demoProducts.id, params.id))
		.limit(1);

	if (!product) {
		error(404, 'Product not found');
	}

	const categories = await db
		.select({
			id: demoCategories.id,
			name: demoCategories.name
		})
		.from(demoCategories)
		.orderBy(demoCategories.name);

	// Convert price from cents to dollars for display
	const priceInDollars = (parseInt(product.price) / 100).toFixed(2);
	const compareAtPriceInDollars = product.compareAtPrice
		? (parseInt(product.compareAtPrice) / 100).toFixed(2)
		: '';

	return {
		product: {
			...product,
			priceDisplay: priceInDollars,
			compareAtPriceDisplay: compareAtPriceInDollars
		},
		categories
	};
};

export const actions: Actions = {
	update: async ({ params, request, platform }) => {
		const databaseUrl = platform?.env?.DATABASE_URL;
		if (!databaseUrl) {
			return fail(500, { error: 'Database not configured' });
		}

		const formData = await request.formData();
		const name = formData.get('name') as string;
		const slug = formData.get('slug') as string;
		const description = formData.get('description') as string;
		const price = formData.get('price') as string;
		const compareAtPrice = formData.get('compareAtPrice') as string;
		const image = formData.get('image') as string;
		const categoryId = formData.get('categoryId') as string;
		const inventory = formData.get('inventory') as string;
		const published = formData.get('published') === 'on';
		const featured = formData.get('featured') === 'on';

		// Validation
		if (!name || !slug || !price) {
			return fail(400, { error: 'Name, slug, and price are required' });
		}

		// Convert price to cents
		const priceInCents = Math.round(parseFloat(price) * 100).toString();
		const compareAtPriceInCents = compareAtPrice
			? Math.round(parseFloat(compareAtPrice) * 100).toString()
			: null;

		const db = createDb(databaseUrl);

		try {
			await db
				.update(demoProducts)
				.set({
					name,
					slug,
					description: description || null,
					price: priceInCents,
					compareAtPrice: compareAtPriceInCents,
					image: image || null,
					categoryId: categoryId || null,
					inventory: inventory || '0',
					published,
					featured,
					updatedAt: new Date()
				})
				.where(eq(demoProducts.id, params.id));

			redirect(302, '/modules/store/admin');
		} catch (e) {
			const err = e as { code?: string };
			if (err.code === '23505') {
				return fail(400, { error: 'A product with this slug already exists' });
			}
			console.error('Failed to update product:', e);
			return fail(500, { error: 'Failed to update product' });
		}
	},

	delete: async ({ params, platform }) => {
		const databaseUrl = platform?.env?.DATABASE_URL;
		if (!databaseUrl) {
			return fail(500, { error: 'Database not configured' });
		}

		const db = createDb(databaseUrl);

		try {
			await db.delete(demoProducts).where(eq(demoProducts.id, params.id));
			redirect(302, '/modules/store/admin');
		} catch {
			return fail(500, { error: 'Failed to delete product' });
		}
	}
};
