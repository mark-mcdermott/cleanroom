import { error, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { createStripe } from '$lib/server/stripe';
import { createDb, orders } from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, platform }) => {
	const sessionId = url.searchParams.get('session_id');

	if (!sessionId) {
		redirect(302, '/merch');
	}

	const stripeSecretKey = platform?.env?.STRIPE_SECRET_KEY;
	const databaseUrl = platform?.env?.DATABASE_URL;

	if (!stripeSecretKey || !databaseUrl) {
		error(500, 'Configuration error');
	}

	const stripe = createStripe(stripeSecretKey);
	const db = createDb(databaseUrl);

	try {
		// Retrieve the checkout session from Stripe
		const session = await stripe.checkout.sessions.retrieve(sessionId, {
			expand: ['line_items']
		});

		if (session.payment_status !== 'paid') {
			redirect(302, '/merch?error=payment_incomplete');
		}

		// Get order from database
		const orderId = session.metadata?.orderId;
		let order = null;

		if (orderId) {
			const [dbOrder] = await db
				.select()
				.from(orders)
				.where(eq(orders.id, orderId))
				.limit(1);
			order = dbOrder;
		}

		// Get shipping details from collected_information or shipping_details
		const sessionAny = session as unknown as {
			collected_information?: { shipping_details?: { address?: Record<string, unknown>; name?: string } };
			shipping_details?: { address?: Record<string, unknown>; name?: string };
		};
		const shippingDetails = sessionAny.collected_information?.shipping_details || sessionAny.shipping_details;
		const shippingAddress = shippingDetails?.address;
		const shippingName = shippingDetails?.name;

		return {
			orderNumber: orderId || session.id.slice(-8).toUpperCase(),
			email: session.customer_details?.email || session.customer_email || '',
			total: session.amount_total ? session.amount_total / 100 : 0,
			shippingAddress: shippingAddress
				? {
						name: shippingName as string | undefined,
						line1: shippingAddress.line1 as string | undefined,
						line2: shippingAddress.line2 as string | undefined,
						city: shippingAddress.city as string | undefined,
						state: shippingAddress.state as string | undefined,
						postalCode: shippingAddress.postal_code as string | undefined,
						country: shippingAddress.country as string | undefined
					}
				: null,
			items: order?.items || []
		};
	} catch (err) {
		console.error('Error retrieving order:', err);
		redirect(302, '/merch?error=order_not_found');
	}
};
