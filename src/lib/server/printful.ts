// Printful API client for order fulfillment

const PRINTFUL_API_BASE = 'https://api.printful.com';

interface PrintfulRecipient {
	name: string;
	address1: string;
	address2?: string;
	city: string;
	state_code?: string;
	country_code: string;
	zip: string;
	email: string;
}

interface PrintfulOrderItem {
	sync_variant_id: number;
	quantity: number;
}

interface PrintfulOrderRequest {
	recipient: PrintfulRecipient;
	items: PrintfulOrderItem[];
	retail_costs?: {
		subtotal: string;
		shipping: string;
		total: string;
	};
}

interface PrintfulOrderResponse {
	id: number;
	status: string;
	shipping: string;
	created: number;
	updated: number;
	recipient: PrintfulRecipient;
	items: Array<{
		id: number;
		sync_variant_id: number;
		quantity: number;
		name: string;
	}>;
}

export function createPrintfulClient(apiKey: string, storeId?: string) {
	async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
		const headers: Record<string, string> = {
			Authorization: `Bearer ${apiKey}`,
			'Content-Type': 'application/json',
			...(options.headers as Record<string, string>)
		};

		if (storeId) {
			headers['X-PF-Store-Id'] = storeId;
		}

		const response = await fetch(`${PRINTFUL_API_BASE}${endpoint}`, {
			...options,
			headers
		});

		const data = await response.json();

		if (!response.ok) {
			console.error('Printful API error:', data);
			throw new Error(data.error?.message || `Printful API error: ${response.status}`);
		}

		return data.result;
	}

	return {
		async createOrder(order: PrintfulOrderRequest): Promise<PrintfulOrderResponse> {
			console.log('Creating Printful order:', JSON.stringify(order, null, 2));
			return request<PrintfulOrderResponse>('/orders', {
				method: 'POST',
				body: JSON.stringify(order)
			});
		},

		async getOrder(orderId: number): Promise<PrintfulOrderResponse> {
			return request<PrintfulOrderResponse>(`/orders/${orderId}`);
		},

		async estimateShipping(
			recipient: PrintfulRecipient,
			items: PrintfulOrderItem[]
		): Promise<Array<{ id: string; name: string; rate: string }>> {
			return request('/shipping/rates', {
				method: 'POST',
				body: JSON.stringify({ recipient, items })
			});
		}
	};
}
