// Script to fetch sync variant IDs from Printful store
// Run with: npx tsx scripts/fetch-printful-products.ts

import 'dotenv/config';

const PRINTFUL_API_KEY = process.env.PRINTFUL_API_KEY;
const PRINTFUL_STORE_ID = process.env.PRINTFUL_STORE_ID;

if (!PRINTFUL_API_KEY) {
	console.error('Error: PRINTFUL_API_KEY environment variable is not set');
	process.exit(1);
}

interface SyncVariant {
	id: number;
	sync_product_id: number;
	name: string;
	synced: boolean;
	variant_id: number;
	retail_price: string;
	currency: string;
	sku: string;
	product?: {
		variant_id: number;
		product_id: number;
		name: string;
		size: string;
		color: string;
	};
	// Alternative fields that might contain size/color
	size?: string;
	color?: string;
}

interface SyncProduct {
	id: number;
	external_id: string;
	name: string;
	variants: number;
	synced: number;
	thumbnail_url: string;
}

interface SyncProductDetails {
	sync_product: SyncProduct;
	sync_variants: SyncVariant[];
}

async function fetchPrintful<T>(endpoint: string, useStoreId = true): Promise<T> {
	const headers: Record<string, string> = {
		Authorization: `Bearer ${PRINTFUL_API_KEY}`,
		'Content-Type': 'application/json'
	};

	if (useStoreId && PRINTFUL_STORE_ID) {
		headers['X-PF-Store-Id'] = PRINTFUL_STORE_ID;
	}

	const response = await fetch(`https://api.printful.com${endpoint}`, { headers });
	const data = await response.json();

	if (!response.ok) {
		throw new Error(data.error?.message || `Printful API error: ${response.status}`);
	}

	return data.result;
}

interface Store {
	id: number;
	name: string;
	type: string;
}

async function listStores(): Promise<Store[]> {
	return fetchPrintful<Store[]>('/stores', false);
}

async function main() {
	// Always list stores first
	console.log('Listing all Printful stores on this account...\n');
	const stores = await listStores();

	console.log('Your Printful Stores:');
	console.log('='.repeat(50));
	for (const store of stores) {
		console.log(`  ID: ${store.id} - ${store.name} (${store.type})`);
	}
	console.log('='.repeat(50));

	if (!PRINTFUL_STORE_ID) {
		console.log('\nNo PRINTFUL_STORE_ID set.');
		console.log('To fetch products, run again with PRINTFUL_STORE_ID set.');
		return;
	}

	console.log(`Fetching products from Printful store ${PRINTFUL_STORE_ID}...\n`);

	const products = await fetchPrintful<SyncProduct[]>('/store/products');

	console.log(`Found ${products.length} products:\n`);

	for (const product of products) {
		console.log(`\n${'='.repeat(60)}`);
		console.log(`Product: ${product.name}`);
		console.log(`Product ID: ${product.id}`);
		console.log(`${'='.repeat(60)}`);

		const details = await fetchPrintful<SyncProductDetails>(`/store/products/${product.id}`);

		console.log(`\nVariants (${details.sync_variants.length}):`);
		console.log('-'.repeat(60));

		const variantsByColor = new Map<string, SyncVariant[]>();
		for (const variant of details.sync_variants) {
			const color = variant.product?.color || 'Unknown';
			if (!variantsByColor.has(color)) {
				variantsByColor.set(color, []);
			}
			variantsByColor.get(color)!.push(variant);
		}

		for (const [color, variants] of variantsByColor) {
			console.log(`\n  ${color}:`);
			for (const variant of variants) {
				const size = variant.product?.size || 'Unknown';
				console.log(`    ${size.padEnd(6)} -> printfulSyncVariantId: '${variant.id}'`);
			}
		}

		console.log(`\n  // Code format for products.ts:`);
		for (const variant of details.sync_variants) {
			// Try multiple sources for size/color
			let size = variant.product?.size || variant.size || '';
			let color = variant.product?.color || variant.color || '';

			// Parse from variant name if not found (e.g., "Product Name - Black / M")
			if (!size || !color) {
				const nameParts = variant.name.split(' - ');
				if (nameParts.length > 1) {
					const variantPart = nameParts[nameParts.length - 1];
					const [colorPart, sizePart] = variantPart.split(' / ');
					if (!color && colorPart) color = colorPart.trim();
					if (!size && sizePart) size = sizePart.trim();
				}
			}

			if (!size) size = 'Unknown';
			if (!color) color = 'Unknown';

			const colorHex = getColorHex(color);
			const variantId = generateVariantId(product.name, size, color);
			console.log(
				`  { id: '${variantId}', size: '${size}', color: '${color}', colorHex: '${colorHex}', printfulSyncVariantId: '${variant.id}', inStock: true },`
			);
		}
	}

	console.log('\n\nDone! Copy the variant data above into src/lib/data/products.ts');
}

function generateVariantId(productName: string, size: string, color: string): string {
	const slug = productName
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/-+/g, '-')
		.replace(/^-|-$/g, '');
	return `${slug}-${color.toLowerCase().replace(/\s+/g, '-')}-${size.toLowerCase()}`;
}

function getColorHex(color: string): string {
	const colorMap: Record<string, string> = {
		White: '#ffffff',
		Black: '#1a1a1a',
		'French Navy': '#1e3a5f',
		'Heather Grey': '#9ca3af',
		Stone: '#d4c4b0',
		Navy: '#1f3044',
		'Classic Navy': '#1f3044',
		'Alpine Green': '#2d5a47',
		'Charcoal Heather': '#4a4a4a',
		Red: '#dc2626',
		Blue: '#2563eb',
		Green: '#16a34a',
		Yellow: '#facc15',
		Pink: '#ec4899',
		Purple: '#9333ea',
		Orange: '#f97316',
		Grey: '#6b7280',
		Gray: '#6b7280',
		Charcoal: '#36454f',
		Maroon: '#800000'
	};
	return colorMap[color] || '#888888';
}

main().catch((error) => {
	console.error('Error:', error.message);
	process.exit(1);
});
