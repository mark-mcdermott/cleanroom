import { fail, redirect } from '@sveltejs/kit';
import { createDb, demoProducts, demoCategories } from '$lib/server/db';
import type { PageServerLoad, Actions } from './$types';

export const prerender = false;

export const load: PageServerLoad = async ({ platform }) => {
	const databaseUrl = platform?.env?.DATABASE_URL;
	if (!databaseUrl) {
		return { categories: [] };
	}

	const db = createDb(databaseUrl);

	const categories = await db
		.select({
			id: demoCategories.id,
			name: demoCategories.name
		})
		.from(demoCategories)
		.orderBy(demoCategories.name);

	return { categories };
};

export const actions: Actions = {
	default: async ({ request, platform }) => {
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
			const productId = crypto.randomUUID();

			await db.insert(demoProducts).values({
				id: productId,
				name,
				slug,
				description: description || null,
				price: priceInCents,
				compareAtPrice: compareAtPriceInCents,
				image: image || null,
				categoryId: categoryId || null,
				inventory: inventory || '0',
				published,
				featured
			});

			redirect(302, '/modules/store/admin');
		} catch (e) {
			const error = e as { code?: string };
			if (error.code === '23505') {
				return fail(400, { error: 'A product with this slug already exists' });
			}
			console.error('Failed to create product:', e);
			return fail(500, { error: 'Failed to create product' });
		}
	}
};
