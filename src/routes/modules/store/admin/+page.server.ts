import { fail } from '@sveltejs/kit';
import { desc, eq } from 'drizzle-orm';
import { createDb, demoProducts, demoCategories, demoCartItems, demoOrders, demoOrderItems } from '$lib/server/db';
import type { PageServerLoad, Actions } from './$types';

export const prerender = false;

export const load: PageServerLoad = async ({ platform }) => {
	const databaseUrl = platform?.env?.DATABASE_URL;
	if (!databaseUrl) {
		return { products: [], categories: [] };
	}

	const db = createDb(databaseUrl);

	const allProducts = await db
		.select({
			id: demoProducts.id,
			name: demoProducts.name,
			slug: demoProducts.slug,
			price: demoProducts.price,
			inventory: demoProducts.inventory,
			published: demoProducts.published,
			featured: demoProducts.featured,
			categoryId: demoProducts.categoryId,
			createdAt: demoProducts.createdAt,
			updatedAt: demoProducts.updatedAt
		})
		.from(demoProducts)
		.orderBy(desc(demoProducts.createdAt));

	const allCategories = await db
		.select({
			id: demoCategories.id,
			name: demoCategories.name
		})
		.from(demoCategories);

	// Create a map for category names
	const categoryMap = new Map(allCategories.map((c) => [c.id, c.name]));

	const productsWithCategory = allProducts.map((p) => ({
		...p,
		categoryName: p.categoryId ? categoryMap.get(p.categoryId) : null
	}));

	return { products: productsWithCategory, categories: allCategories };
};

export const actions: Actions = {
	delete: async ({ request, platform }) => {
		const databaseUrl = platform?.env?.DATABASE_URL;
		if (!databaseUrl) {
			return fail(500, { error: 'Database not configured' });
		}

		const formData = await request.formData();
		const productId = formData.get('productId') as string;

		if (!productId) {
			return fail(400, { error: 'Product ID is required' });
		}

		const db = createDb(databaseUrl);

		try {
			await db.delete(demoProducts).where(eq(demoProducts.id, productId));
			return { success: true };
		} catch {
			return fail(500, { error: 'Failed to delete product' });
		}
	},

	reset: async ({ platform }) => {
		const databaseUrl = platform?.env?.DATABASE_URL;
		if (!databaseUrl) {
			return fail(500, { error: 'Database not configured' });
		}

		const db = createDb(databaseUrl);

		try {
			// Clear existing data
			await db.delete(demoOrderItems);
			await db.delete(demoOrders);
			await db.delete(demoCartItems);
			await db.delete(demoProducts);
			await db.delete(demoCategories);

			// Create categories
			const categories = [
				{
					id: 'cat-tshirts',
					name: 'T-Shirts',
					slug: 't-shirts',
					description: 'Comfortable and stylish t-shirts',
					image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop'
				},
				{
					id: 'cat-hoodies',
					name: 'Hoodies',
					slug: 'hoodies',
					description: 'Cozy hoodies for any occasion',
					image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop'
				},
				{
					id: 'cat-accessories',
					name: 'Accessories',
					slug: 'accessories',
					description: 'Hats, bags, and more',
					image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&h=400&fit=crop'
				}
			];

			for (const cat of categories) {
				await db.insert(demoCategories).values(cat);
			}

			// Create products
			const products = [
				{
					id: 'prod-1',
					name: 'Classic Black Tee',
					slug: 'classic-black-tee',
					description: 'A timeless black t-shirt made from 100% organic cotton. Perfect for everyday wear.',
					price: '2999', // $29.99
					compareAtPrice: null,
					image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop',
					categoryId: 'cat-tshirts',
					inventory: '50',
					published: true,
					featured: true
				},
				{
					id: 'prod-2',
					name: 'Vintage White Tee',
					slug: 'vintage-white-tee',
					description: 'A soft, vintage-style white t-shirt with a relaxed fit.',
					price: '2499', // $24.99
					compareAtPrice: '3499', // Was $34.99
					image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&h=800&fit=crop',
					categoryId: 'cat-tshirts',
					inventory: '25',
					published: true,
					featured: false
				},
				{
					id: 'prod-3',
					name: 'Navy Blue Tee',
					slug: 'navy-blue-tee',
					description: 'Classic navy blue t-shirt with a modern cut.',
					price: '2799', // $27.99
					compareAtPrice: null,
					image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&h=800&fit=crop',
					categoryId: 'cat-tshirts',
					inventory: '0', // Out of stock
					published: true,
					featured: false
				},
				{
					id: 'prod-4',
					name: 'Premium Zip Hoodie',
					slug: 'premium-zip-hoodie',
					description: 'A premium zip-up hoodie with a soft fleece interior. Perfect for chilly days.',
					price: '6999', // $69.99
					compareAtPrice: null,
					image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=800&fit=crop',
					categoryId: 'cat-hoodies',
					inventory: '30',
					published: true,
					featured: true
				},
				{
					id: 'prod-5',
					name: 'Pullover Hoodie',
					slug: 'pullover-hoodie',
					description: 'Cozy pullover hoodie with kangaroo pocket.',
					price: '5499', // $54.99
					compareAtPrice: '6499', // Was $64.99
					image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&h=800&fit=crop',
					categoryId: 'cat-hoodies',
					inventory: '15',
					published: true,
					featured: false
				},
				{
					id: 'prod-6',
					name: 'Classic Snapback Cap',
					slug: 'classic-snapback-cap',
					description: 'Adjustable snapback cap with embroidered logo.',
					price: '2499', // $24.99
					compareAtPrice: null,
					image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&h=800&fit=crop',
					categoryId: 'cat-accessories',
					inventory: '100',
					published: true,
					featured: false
				},
				{
					id: 'prod-7',
					name: 'Canvas Tote Bag',
					slug: 'canvas-tote-bag',
					description: 'Durable canvas tote bag, perfect for shopping or everyday use.',
					price: '1999', // $19.99
					compareAtPrice: null,
					image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&h=800&fit=crop',
					categoryId: 'cat-accessories',
					inventory: '75',
					published: true,
					featured: false
				},
				{
					id: 'prod-8',
					name: 'Limited Edition Tee',
					slug: 'limited-edition-tee',
					description: 'Limited edition graphic tee. Get yours before they are gone!',
					price: '3999', // $39.99
					compareAtPrice: null,
					image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&h=800&fit=crop',
					categoryId: 'cat-tshirts',
					inventory: '10',
					published: true,
					featured: true
				}
			];

			for (const prod of products) {
				await db.insert(demoProducts).values(prod);
			}

			return { success: true, message: 'Demo data reset successfully' };
		} catch (e) {
			console.error('Failed to reset demo data:', e);
			return fail(500, { error: 'Failed to reset demo data' });
		}
	}
};
