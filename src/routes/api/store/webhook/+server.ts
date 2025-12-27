import { json, error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { createStripe } from '$lib/server/stripe';
import { createPrintfulClient } from '$lib/server/printful';
import { createDb, orders } from '$lib/server/db';
import type { RequestHandler } from './$types';
import type Stripe from 'stripe';

export const POST: RequestHandler = async ({ request, platform }) => {
	console.log('=== WEBHOOK RECEIVED ===');
	console.log('Timestamp:', new Date().toISOString());

	const stripeSecretKey = platform?.env?.STRIPE_SECRET_KEY;
	const stripeWebhookSecret = platform?.env?.STRIPE_WEBHOOK_SECRET;
	const printfulApiKey = platform?.env?.PRINTFUL_API_KEY;
	const printfulStoreId = platform?.env?.PRINTFUL_STORE_ID;
	const databaseUrl = platform?.env?.DATABASE_URL;

	console.log('Environment check:', {
		hasStripeSecretKey: !!stripeSecretKey,
		hasStripeWebhookSecret: !!stripeWebhookSecret,
		hasPrintfulApiKey: !!printfulApiKey,
		hasPrintfulStoreId: !!printfulStoreId,
		printfulStoreId: printfulStoreId,
		hasDatabaseUrl: !!databaseUrl
	});

	if (!stripeSecretKey || !stripeWebhookSecret || !databaseUrl) {
		console.error('Missing required environment variables');
		error(500, 'Configuration error');
	}

	const stripe = createStripe(stripeSecretKey);
	const db = createDb(databaseUrl);

	// Get the raw body for signature verification
	const body = await request.text();
	const signature = request.headers.get('stripe-signature');

	if (!signature) {
		error(400, 'Missing stripe-signature header');
	}

	let event: Stripe.Event;

	try {
		console.log('Attempting signature verification...');
		console.log('Signature header:', signature?.substring(0, 50) + '...');
		console.log('Webhook secret starts with:', stripeWebhookSecret?.substring(0, 10) + '...');
		console.log('Body length:', body.length);
		// Use async version for Cloudflare Workers compatibility
		event = await stripe.webhooks.constructEventAsync(body, signature, stripeWebhookSecret);
		console.log('Signature verification SUCCESS');
	} catch (err) {
		console.error('Webhook signature verification failed:', err);
		console.error('Full error:', JSON.stringify(err, Object.getOwnPropertyNames(err)));
		error(400, 'Webhook signature verification failed');
	}

	console.log(`Received Stripe webhook: ${event.type}`);

	// Handle the event
	switch (event.type) {
		case 'checkout.session.completed': {
			const session = event.data.object as Stripe.Checkout.Session;

			// Only process store orders
			if (session.metadata?.type !== 'store_order') {
				console.log('Ignoring non-store order');
				return json({ received: true });
			}

			const orderId = session.metadata?.orderId;
			if (!orderId) {
				console.error('No orderId in session metadata');
				return json({ received: true });
			}

			console.log(`Processing order: ${orderId}`);
			console.log('Session metadata:', session.metadata);
			console.log('Session customer_details:', session.customer_details);

			// Get order from database
			const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);

			if (!order) {
				console.error(`Order not found in database: ${orderId}`);
				return json({ received: true });
			}

			console.log('Order from database:', {
				id: order.id,
				email: order.email,
				status: order.status,
				itemCount: Array.isArray(order.items) ? order.items.length : 'not array'
			});

			// Get shipping address from Stripe session
			const shippingDetails = (session as unknown as {
				shipping_details?: {
					name?: string;
					address?: {
						line1?: string;
						line2?: string;
						city?: string;
						state?: string;
						postal_code?: string;
						country?: string;
					};
				};
			}).shipping_details;

			console.log('Shipping details from Stripe:', JSON.stringify(shippingDetails, null, 2));

			if (!shippingDetails?.address) {
				console.error('No shipping address in session');
				await db
					.update(orders)
					.set({ status: 'error', printfulStatus: 'missing_address' })
					.where(eq(orders.id, orderId));
				return json({ received: true });
			}

			// Update order with email and mark as paid
			await db
				.update(orders)
				.set({
					email: session.customer_details?.email || order.email,
					status: 'paid',
					shipping: session.total_details?.amount_shipping || 0,
					total: session.amount_total || order.total
				})
				.where(eq(orders.id, orderId));

			// Create Printful order if API key is available
			if (printfulApiKey) {
				try {
					console.log('Creating Printful client with store ID:', printfulStoreId);
					const printful = createPrintfulClient(printfulApiKey, printfulStoreId);

					const orderItems = order.items as Array<{
						printfulSyncVariantId: string;
						quantity: number;
					}>;

					console.log('Order items for Printful:', JSON.stringify(orderItems, null, 2));

					const printfulRequest = {
						recipient: {
							name: shippingDetails.name || 'Customer',
							address1: shippingDetails.address.line1 || '',
							address2: shippingDetails.address.line2 || undefined,
							city: shippingDetails.address.city || '',
							state_code: shippingDetails.address.state || undefined,
							country_code: shippingDetails.address.country || 'US',
							zip: shippingDetails.address.postal_code || '',
							email: session.customer_details?.email || order.email
						},
						items: orderItems.map((item) => ({
							sync_variant_id: parseInt(item.printfulSyncVariantId, 10),
							quantity: item.quantity
						}))
					};

					console.log('Printful order request:', JSON.stringify(printfulRequest, null, 2));

					const printfulOrder = await printful.createOrder(printfulRequest);

					console.log('Printful order created successfully:', JSON.stringify(printfulOrder, null, 2));

					// Update order with Printful info
					await db
						.update(orders)
						.set({
							printfulOrderId: printfulOrder.id.toString(),
							printfulStatus: printfulOrder.status,
							status: 'processing'
						})
						.where(eq(orders.id, orderId));
				} catch (printfulError) {
					console.error('Failed to create Printful order:', printfulError);
					await db
						.update(orders)
						.set({
							status: 'error',
							printfulStatus: `error: ${printfulError instanceof Error ? printfulError.message : 'Unknown error'}`
						})
						.where(eq(orders.id, orderId));
				}
			} else {
				console.warn('PRINTFUL_API_KEY not configured - order will not be sent to Printful');
			}

			break;
		}

		case 'checkout.session.expired': {
			const session = event.data.object as Stripe.Checkout.Session;
			const orderId = session.metadata?.orderId;

			if (orderId) {
				await db.update(orders).set({ status: 'expired' }).where(eq(orders.id, orderId));
			}
			break;
		}

		default:
			console.log(`Unhandled event type: ${event.type}`);
	}

	return json({ received: true });
};
