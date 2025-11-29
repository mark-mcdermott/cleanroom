import { fail } from '@sveltejs/kit';
import { createDb, demoCartItems, demoProducts } from '$lib/server/db';
import { eq, and } from 'drizzle-orm';
import type { PageServerLoad, Actions } from './$types';

export const prerender = false;

export const load: PageServerLoad = async ({ platform, cookies }) => {
	const databaseUrl = platform?.env?.DATABASE_URL;
	const sessionId = cookies.get('store_session');

	if (!databaseUrl || !sessionId) {
		return { items: [], subtotal: 0 };
	}

	const db = createDb(databaseUrl);

	// Get cart items with product details
	const cartItems = await db
		.select({
			id: demoCartItems.id,
			quantity: demoCartItems.quantity,
			productId: demoCartItems.productId,
			productName: demoProducts.name,
			productSlug: demoProducts.slug,
			productPrice: demoProducts.price,
			productImage: demoProducts.image,
			productInventory: demoProducts.inventory
		})
		.from(demoCartItems)
		.leftJoin(demoProducts, eq(demoCartItems.productId, demoProducts.id))
		.where(eq(demoCartItems.sessionId, sessionId));

	// Filter out items where product no longer exists
	const validItems = cartItems.filter((item) => item.productName !== null);

	// Calculate subtotal
	const subtotal = validItems.reduce((sum, item) => {
		return sum + parseInt(item.productPrice || '0') * parseInt(item.quantity);
	}, 0);

	return { items: validItems, subtotal };
};

export const actions: Actions = {
	updateQuantity: async ({ request, platform, cookies }) => {
		const databaseUrl = platform?.env?.DATABASE_URL;
		const sessionId = cookies.get('store_session');

		if (!databaseUrl || !sessionId) {
			return fail(500, { error: 'Session not found' });
		}

		const formData = await request.formData();
		const itemId = formData.get('itemId') as string;
		const quantity = parseInt(formData.get('quantity') as string);

		if (!itemId || isNaN(quantity)) {
			return fail(400, { error: 'Invalid request' });
		}

		const db = createDb(databaseUrl);

		try {
			if (quantity <= 0) {
				// Remove item if quantity is 0 or negative
				await db
					.delete(demoCartItems)
					.where(and(eq(demoCartItems.id, itemId), eq(demoCartItems.sessionId, sessionId)));
			} else {
				// Update quantity
				await db
					.update(demoCartItems)
					.set({ quantity: quantity.toString(), updatedAt: new Date() })
					.where(and(eq(demoCartItems.id, itemId), eq(demoCartItems.sessionId, sessionId)));
			}
			return { success: true };
		} catch {
			return fail(500, { error: 'Failed to update cart' });
		}
	},

	removeItem: async ({ request, platform, cookies }) => {
		const databaseUrl = platform?.env?.DATABASE_URL;
		const sessionId = cookies.get('store_session');

		if (!databaseUrl || !sessionId) {
			return fail(500, { error: 'Session not found' });
		}

		const formData = await request.formData();
		const itemId = formData.get('itemId') as string;

		if (!itemId) {
			return fail(400, { error: 'Item ID is required' });
		}

		const db = createDb(databaseUrl);

		try {
			await db
				.delete(demoCartItems)
				.where(and(eq(demoCartItems.id, itemId), eq(demoCartItems.sessionId, sessionId)));
			return { success: true };
		} catch {
			return fail(500, { error: 'Failed to remove item' });
		}
	},

	clearCart: async ({ platform, cookies }) => {
		const databaseUrl = platform?.env?.DATABASE_URL;
		const sessionId = cookies.get('store_session');

		if (!databaseUrl || !sessionId) {
			return fail(500, { error: 'Session not found' });
		}

		const db = createDb(databaseUrl);

		try {
			await db.delete(demoCartItems).where(eq(demoCartItems.sessionId, sessionId));
			return { success: true };
		} catch {
			return fail(500, { error: 'Failed to clear cart' });
		}
	}
};
