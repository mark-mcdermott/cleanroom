import { createDb, demoProducts, demoCategories } from '$lib/server/db';
import { desc, eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const prerender = false;

export const load: PageServerLoad = async ({ platform, url }) => {
	const databaseUrl = platform?.env?.DATABASE_URL;

	if (!databaseUrl) {
		return { products: [], categories: [], selectedCategory: null };
	}

	const db = createDb(databaseUrl);
	const categorySlug = url.searchParams.get('category');

	// Fetch categories
	const allCategories = await db
		.select({
			id: demoCategories.id,
			name: demoCategories.name,
			slug: demoCategories.slug
		})
		.from(demoCategories)
		.orderBy(demoCategories.name);

	// Fetch products with optional category filter
	let productsQuery = db
		.select({
			id: demoProducts.id,
			name: demoProducts.name,
			slug: demoProducts.slug,
			price: demoProducts.price,
			compareAtPrice: demoProducts.compareAtPrice,
			image: demoProducts.image,
			categoryId: demoProducts.categoryId,
			inventory: demoProducts.inventory,
			featured: demoProducts.featured
		})
		.from(demoProducts)
		.where(eq(demoProducts.published, true))
		.orderBy(desc(demoProducts.featured), desc(demoProducts.createdAt));

	let allProducts = await productsQuery;

	// Filter by category if specified
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
