import { fail, redirect } from '@sveltejs/kit';
import { createDb, demoCartItems, demoProducts, demoOrders, demoOrderItems } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import type { PageServerLoad, Actions } from './$types';

export const prerender = false;

export const load: PageServerLoad = async ({ platform, cookies }) => {
	const databaseUrl = platform?.env?.DATABASE_URL;
	const sessionId = cookies.get('store_session');

	if (!databaseUrl || !sessionId) {
		redirect(302, '/modules/store/cart');
	}

	const db = createDb(databaseUrl);

	// Get cart items with product details
	const cartItems = await db
		.select({
			id: demoCartItems.id,
			quantity: demoCartItems.quantity,
			productId: demoCartItems.productId,
			productName: demoProducts.name,
			productPrice: demoProducts.price,
			productImage: demoProducts.image
		})
		.from(demoCartItems)
		.leftJoin(demoProducts, eq(demoCartItems.productId, demoProducts.id))
		.where(eq(demoCartItems.sessionId, sessionId));

	// Filter out items where product no longer exists
	const validItems = cartItems.filter((item) => item.productName !== null);

	if (validItems.length === 0) {
		redirect(302, '/modules/store/cart');
	}

	// Calculate totals
	const subtotal = validItems.reduce((sum, item) => {
		return sum + parseInt(item.productPrice || '0') * parseInt(item.quantity);
	}, 0);

	const tax = Math.round(subtotal * 0.08); // 8% tax
	const shipping = subtotal > 5000 ? 0 : 999; // Free shipping over $50
	const total = subtotal + tax + shipping;

	return { items: validItems, subtotal, tax, shipping, total };
};

export const actions: Actions = {
	placeOrder: async ({ request, platform, cookies }) => {
		const databaseUrl = platform?.env?.DATABASE_URL;
		const sessionId = cookies.get('store_session');

		if (!databaseUrl || !sessionId) {
			return fail(500, { error: 'Session not found' });
		}

		const formData = await request.formData();
		const email = formData.get('email') as string;
		const firstName = formData.get('firstName') as string;
		const lastName = formData.get('lastName') as string;
		const address = formData.get('address') as string;
		const city = formData.get('city') as string;
		const state = formData.get('state') as string;
		const zip = formData.get('zip') as string;

		// Validate required fields
		if (!email || !firstName || !lastName || !address || !city || !state || !zip) {
			return fail(400, { error: 'All fields are required' });
		}

		const db = createDb(databaseUrl);

		try {
			// Get cart items
			const cartItems = await db
				.select({
					id: demoCartItems.id,
					quantity: demoCartItems.quantity,
					productId: demoCartItems.productId,
					productName: demoProducts.name,
					productPrice: demoProducts.price,
					productImage: demoProducts.image
				})
				.from(demoCartItems)
				.leftJoin(demoProducts, eq(demoCartItems.productId, demoProducts.id))
				.where(eq(demoCartItems.sessionId, sessionId));

			const validItems = cartItems.filter((item) => item.productName !== null);

			if (validItems.length === 0) {
				return fail(400, { error: 'Cart is empty' });
			}

			// Calculate totals
			const subtotal = validItems.reduce((sum, item) => {
				return sum + parseInt(item.productPrice || '0') * parseInt(item.quantity);
			}, 0);

			const tax = Math.round(subtotal * 0.08);
			const shipping = subtotal > 5000 ? 0 : 999;
			const total = subtotal + tax + shipping;

			// Create shipping address JSON
			const shippingAddress = JSON.stringify({
				firstName,
				lastName,
				address,
				city,
				state,
				zip
			});

			// Create order
			const orderId = crypto.randomUUID();
			await db.insert(demoOrders).values({
				id: orderId,
				sessionId,
				email,
				status: 'processing',
				subtotal: subtotal.toString(),
				tax: tax.toString(),
				shipping: shipping.toString(),
				total: total.toString(),
				shippingAddress,
				billingAddress: shippingAddress // Same as shipping for demo
			});

			// Create order items
			for (const item of validItems) {
				await db.insert(demoOrderItems).values({
					id: crypto.randomUUID(),
					orderId,
					productId: item.productId,
					productName: item.productName || 'Unknown Product',
					productImage: item.productImage,
					price: item.productPrice || '0',
					quantity: item.quantity
				});
			}

			// Clear cart
			await db.delete(demoCartItems).where(eq(demoCartItems.sessionId, sessionId));

			return { success: true, orderId };
		} catch (e) {
			console.error('Failed to place order:', e);
			return fail(500, { error: 'Failed to place order' });
		}
	}
};
