import { fail, redirect } from '@sveltejs/kit';
import { createDb, demoTrackerCategories, demoTrackerMetrics } from '$lib/server/db';
import type { PageServerLoad, Actions } from './$types';

export const prerender = false;

export const load: PageServerLoad = async ({ platform }) => {
	const databaseUrl = platform?.env?.DATABASE_URL;
	if (!databaseUrl) {
		return { categories: [] };
	}

	const db = createDb(databaseUrl);

	const categories = await db
		.select()
		.from(demoTrackerCategories)
		.orderBy(demoTrackerCategories.sortOrder);

	return { categories };
};

export const actions: Actions = {
	default: async ({ request, platform }) => {
		const databaseUrl = platform?.env?.DATABASE_URL;
		if (!databaseUrl) {
			return fail(500, { error: 'Database not configured' });
		}

		const formData = await request.formData();
		const name = formData.get('name') as string;
		const categoryId = formData.get('categoryId') as string;
		const unit = formData.get('unit') as string;
		const valueType = formData.get('valueType') as string;
		const icon = formData.get('icon') as string;
		const color = formData.get('color') as string;
		const description = formData.get('description') as string;
		const defaultValue = formData.get('defaultValue') as string;
		const minValue = formData.get('minValue') as string;
		const maxValue = formData.get('maxValue') as string;

		if (!name || !categoryId) {
			return fail(400, { error: 'Name and category are required' });
		}

		const db = createDb(databaseUrl);

		try {
			const slug = name
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, '-')
				.replace(/^-|-$/g, '');

			const id = `metric-${crypto.randomUUID().slice(0, 8)}`;

			await db.insert(demoTrackerMetrics).values({
				id,
				categoryId,
				name,
				slug,
				unit: unit || null,
				valueType: valueType || 'number',
				icon: icon || null,
				color: color || null,
				description: description || null,
				defaultValue: defaultValue || null,
				minValue: minValue || null,
				maxValue: maxValue || null,
				sortOrder: '99'
			});

			throw redirect(303, '/modules/tracker/admin');
		} catch (e) {
			if (e instanceof Response) throw e;
			console.error('Failed to create metric:', e);
			return fail(500, { error: 'Failed to create metric' });
		}
	}
};
