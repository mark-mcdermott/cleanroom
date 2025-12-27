import Stripe from 'stripe';

export function createStripe(secretKey: string) {
	return new Stripe(secretKey);
}

// Generate a unique ID for database records
export function generateId(): string {
	return crypto.randomUUID();
}
