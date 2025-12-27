import { json, error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { createStripe, generateId } from '$lib/server/stripe';
import { createDb, orders } from '$lib/server/db';
import { getProductById, getProductVariant, getProductImage } from '$lib/data/products';
import type { RequestHandler } from './$types';

interface CartItem {
	productId: string;
	variantId: string;
	quantity: number;
}

export const POST: RequestHandler = async ({ request, locals, platform, url }) => {
	const stripeSecretKey = platform?.env?.STRIPE_SECRET_KEY;
	const databaseUrl = platform?.env?.DATABASE_URL;

	if (!stripeSecretKey || !databaseUrl) {
		error(500, 'Stripe not configured');
	}

	const body = await request.json();

	// Support both single item and multiple items (cart)
	let cartItems: CartItem[];
	if (body.items && Array.isArray(body.items)) {
		cartItems = body.items;
	} else if (body.productId && body.variantId) {
		cartItems = [{ productId: body.productId, variantId: body.variantId, quantity: body.quantity || 1 }];
	} else {
		error(400, 'Items or product/variant are required');
	}

	if (cartItems.length === 0) {
		error(400, 'Cart is empty');
	}

	const stripe = createStripe(stripeSecretKey);
	const db = createDb(databaseUrl);

	// Validate all items and build order data
	const orderItems: Array<{
		productId: string;
		variantId: string;
		printfulSyncVariantId: string;
		name: string;
		size: string;
		color: string;
		quantity: number;
		price: number;
	}> = [];

	const stripeLineItems: Array<{
		price_data: {
			currency: string;
			product_data: {
				name: string;
				description: string;
				images?: string[];
			};
			unit_amount: number;
		};
		quantity: number;
	}> = [];

	let subtotal = 0;

	for (const item of cartItems) {
		const product = getProductById(item.productId);
		if (!product) {
			error(404, `Product not found: ${item.productId}`);
		}

		const variant = getProductVariant(item.productId, item.variantId);
		if (!variant || !variant.inStock) {
			error(400, `Variant not available: ${item.variantId}`);
		}

		const quantity = item.quantity || 1;
		const itemPrice = product.price;
		subtotal += itemPrice * quantity;

		orderItems.push({
			productId: product.id,
			variantId: variant.id,
			printfulSyncVariantId: variant.printfulSyncVariantId,
			name: product.name,
			size: variant.size,
			color: variant.color,
			quantity,
			price: itemPrice
		});

		// Get the product image
		const productImage = getProductImage(product, variant.color, 'front');

		stripeLineItems.push({
			price_data: {
				currency: 'usd',
				product_data: {
					name: `${product.name} - ${variant.color} / ${variant.size}`,
					description: product.description,
					...(productImage?.startsWith('http') ? { images: [productImage] } : {})
				},
				unit_amount: itemPrice
			},
			quantity
		});
	}

	// Create order in database
	const orderId = generateId();
	const shipping = 0; // Will be calculated by Stripe shipping options
	const total = subtotal + shipping;

	await db.insert(orders).values({
		id: orderId,
		email: locals.user?.email || '', // Will be updated from Stripe checkout
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
		line_items: stripeLineItems,
		mode: 'payment',
		shipping_address_collection: {
			allowed_countries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'ES', 'IT', 'NL', 'BE', 'AT', 'CH', 'SE', 'NO', 'DK', 'FI', 'IE', 'PT', 'PL', 'CZ']
		},
		shipping_options: [
			{
				shipping_rate_data: {
					type: 'fixed_amount',
					fixed_amount: {
						amount: 500, // $5 flat rate shipping
						currency: 'usd'
					},
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
					fixed_amount: {
						amount: 1500, // $15 express shipping
						currency: 'usd'
					},
					display_name: 'Express Shipping',
					delivery_estimate: {
						minimum: { unit: 'business_day', value: 2 },
						maximum: { unit: 'business_day', value: 5 }
					}
				}
			}
		],
		success_url: `${url.origin}/merch/order-confirmation?session_id={CHECKOUT_SESSION_ID}`,
		cancel_url: `${url.origin}/merch?cancelled=true`,
		metadata: {
			orderId,
			type: 'store_order'
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
