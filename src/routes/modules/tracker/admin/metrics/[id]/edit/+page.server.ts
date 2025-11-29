import { fail, redirect, error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { createDb, demoTrackerCategories, demoTrackerMetrics } from '$lib/server/db';
import type { PageServerLoad, Actions } from './$types';

export const prerender = false;

export const load: PageServerLoad = async ({ platform, params }) => {
	const databaseUrl = platform?.env?.DATABASE_URL;
	if (!databaseUrl) {
		throw error(500, 'Database not configured');
	}

	const db = createDb(databaseUrl);

	const [metric] = await db
		.select()
		.from(demoTrackerMetrics)
		.where(eq(demoTrackerMetrics.id, params.id))
		.limit(1);

	if (!metric) {
		throw error(404, 'Metric not found');
	}

	const categories = await db
		.select()
		.from(demoTrackerCategories)
		.orderBy(demoTrackerCategories.sortOrder);

	return { metric, categories };
};

export const actions: Actions = {
	update: async ({ request, platform, params }) => {
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
		const archived = formData.get('archived') === 'true';

		if (!name || !categoryId) {
			return fail(400, { error: 'Name and category are required' });
		}

		const db = createDb(databaseUrl);

		try {
			const slug = name
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, '-')
				.replace(/^-|-$/g, '');

			await db
				.update(demoTrackerMetrics)
				.set({
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
					archived,
					updatedAt: new Date()
				})
				.where(eq(demoTrackerMetrics.id, params.id));

			throw redirect(303, '/modules/tracker/admin');
		} catch (e) {
			if (e instanceof Response) throw e;
			console.error('Failed to update metric:', e);
			return fail(500, { error: 'Failed to update metric' });
		}
	},

	delete: async ({ platform, params }) => {
		const databaseUrl = platform?.env?.DATABASE_URL;
		if (!databaseUrl) {
			return fail(500, { error: 'Database not configured' });
		}

		const db = createDb(databaseUrl);

		try {
			await db.delete(demoTrackerMetrics).where(eq(demoTrackerMetrics.id, params.id));
			throw redirect(303, '/modules/tracker/admin');
		} catch (e) {
			if (e instanceof Response) throw e;
			console.error('Failed to delete metric:', e);
			return fail(500, { error: 'Failed to delete metric' });
		}
	}
};
