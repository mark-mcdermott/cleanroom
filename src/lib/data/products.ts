export interface ProductVariant {
	id: string;
	size: string;
	color: string;
	colorHex: string;
	printfulSyncVariantId: string; // Printful's sync variant ID for ordering
	inStock: boolean;
}

export interface Product {
	id: string;
	slug: string;
	name: string;
	description: string;
	price: number; // in cents
	images: { [color: string]: { front: string; back: string } };
	category: 'tshirt' | 'hoodie' | 'mug' | 'sticker';
	variants: ProductVariant[];
}

export const products: Product[] = [
	{
		id: 'zip-hoodie',
		slug: 'zip-hoodie',
		name: 'Unisex Fleece Zip Up Hoodie',
		description: 'A cozy fleece zip-up hoodie featuring the Cleanroom skull on front and wombat on back. Perfect for cooler weather with a soft fleece interior and comfortable fit.',
		price: 5500, // $55.00
		images: {
			'Black': { front: '/merch/hoodie-black-front.png', back: '/merch/hoodie-black-back.png' },
			'Charcoal Heather': { front: '/merch/hoodie-charcoal-front.png', back: '/merch/hoodie-charcoal-back.png' },
			'Classic Navy': { front: '/merch/hoodie-navy-front.png', back: '/merch/hoodie-navy-back.png' },
			'Alpine Green': { front: '/merch/hoodie-alpine-green-front.png', back: '/merch/hoodie-alpine-green-back.png' }
		},
		category: 'hoodie',
		variants: [
			// Black
			{ id: 'zip-hoodie-black-s', size: 'S', color: 'Black', colorHex: '#1a1a1a', printfulSyncVariantId: '5122771545', inStock: true },
			{ id: 'zip-hoodie-black-m', size: 'M', color: 'Black', colorHex: '#1a1a1a', printfulSyncVariantId: '5122771546', inStock: true },
			{ id: 'zip-hoodie-black-l', size: 'L', color: 'Black', colorHex: '#1a1a1a', printfulSyncVariantId: '5122771547', inStock: true },
			{ id: 'zip-hoodie-black-xl', size: 'XL', color: 'Black', colorHex: '#1a1a1a', printfulSyncVariantId: '5122771548', inStock: true },
			{ id: 'zip-hoodie-black-2xl', size: '2XL', color: 'Black', colorHex: '#1a1a1a', printfulSyncVariantId: '5122771549', inStock: true },
			// Classic Navy
			{ id: 'zip-hoodie-navy-s', size: 'S', color: 'Classic Navy', colorHex: '#1f3044', printfulSyncVariantId: '5122771550', inStock: true },
			{ id: 'zip-hoodie-navy-m', size: 'M', color: 'Classic Navy', colorHex: '#1f3044', printfulSyncVariantId: '5122771551', inStock: true },
			{ id: 'zip-hoodie-navy-l', size: 'L', color: 'Classic Navy', colorHex: '#1f3044', printfulSyncVariantId: '5122771552', inStock: true },
			{ id: 'zip-hoodie-navy-xl', size: 'XL', color: 'Classic Navy', colorHex: '#1f3044', printfulSyncVariantId: '5122771553', inStock: true },
			{ id: 'zip-hoodie-navy-2xl', size: '2XL', color: 'Classic Navy', colorHex: '#1f3044', printfulSyncVariantId: '5122771554', inStock: true },
			// Charcoal Heather
			{ id: 'zip-hoodie-charcoal-s', size: 'S', color: 'Charcoal Heather', colorHex: '#4a4a4a', printfulSyncVariantId: '5122771555', inStock: true },
			{ id: 'zip-hoodie-charcoal-m', size: 'M', color: 'Charcoal Heather', colorHex: '#4a4a4a', printfulSyncVariantId: '5122771556', inStock: true },
			{ id: 'zip-hoodie-charcoal-l', size: 'L', color: 'Charcoal Heather', colorHex: '#4a4a4a', printfulSyncVariantId: '5122771557', inStock: true },
			{ id: 'zip-hoodie-charcoal-xl', size: 'XL', color: 'Charcoal Heather', colorHex: '#4a4a4a', printfulSyncVariantId: '5122771558', inStock: true },
			{ id: 'zip-hoodie-charcoal-2xl', size: '2XL', color: 'Charcoal Heather', colorHex: '#4a4a4a', printfulSyncVariantId: '5122771559', inStock: true },
			// Alpine Green
			{ id: 'zip-hoodie-green-s', size: 'S', color: 'Alpine Green', colorHex: '#2d5a47', printfulSyncVariantId: '5122771560', inStock: true },
			{ id: 'zip-hoodie-green-m', size: 'M', color: 'Alpine Green', colorHex: '#2d5a47', printfulSyncVariantId: '5122771561', inStock: true },
			{ id: 'zip-hoodie-green-l', size: 'L', color: 'Alpine Green', colorHex: '#2d5a47', printfulSyncVariantId: '5122771562', inStock: true },
			{ id: 'zip-hoodie-green-xl', size: 'XL', color: 'Alpine Green', colorHex: '#2d5a47', printfulSyncVariantId: '5122771563', inStock: true },
			{ id: 'zip-hoodie-green-2xl', size: '2XL', color: 'Alpine Green', colorHex: '#2d5a47', printfulSyncVariantId: '5122771564', inStock: true }
		]
	}
];

// Helper functions
export function getProduct(slug: string): Product | undefined {
	return products.find((p) => p.slug === slug);
}

export function getProductById(id: string): Product | undefined {
	return products.find((p) => p.id === id);
}

export function getProductVariant(productId: string, variantId: string): ProductVariant | undefined {
	const product = products.find((p) => p.id === productId);
	return product?.variants.find((v) => v.id === variantId);
}

export function getAvailableSizes(product: Product): string[] {
	return [...new Set(product.variants.filter((v) => v.inStock).map((v) => v.size))];
}

export function getAvailableColors(product: Product): { color: string; hex: string }[] {
	const colors = new Map<string, string>();
	product.variants.filter((v) => v.inStock).forEach((v) => colors.set(v.color, v.colorHex));
	return Array.from(colors.entries()).map(([color, hex]) => ({ color, hex }));
}

export function getVariantByOptions(product: Product, size: string, color: string): ProductVariant | undefined {
	return product.variants.find((v) => v.size === size && v.color === color && v.inStock);
}

export function formatPrice(cents: number): string {
	return `$${(cents / 100).toFixed(2)}`;
}

export function getProductImage(product: Product, color: string, side: 'front' | 'back' = 'front'): string {
	const colorImages = product.images[color];
	if (colorImages) {
		return colorImages[side];
	}
	// Fallback to first available color
	const firstColor = Object.keys(product.images)[0];
	return product.images[firstColor]?.[side] || '';
}
