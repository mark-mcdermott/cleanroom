import { fail, redirect } from '@sveltejs/kit';
import {
	createDb,
	demoTrackerCategories,
	demoTrackerMetrics,
	demoTrackerEntries
} from '$lib/server/db';
import { eq } from 'drizzle-orm';
import type { PageServerLoad, Actions } from './$types';

export const prerender = false;

export const load: PageServerLoad = async ({ platform, url }) => {
	const databaseUrl = platform?.env?.DATABASE_URL;
	const categorySlug = url.searchParams.get('category');
	const metricId = url.searchParams.get('metric');

	if (!databaseUrl) {
		return { categories: [], metrics: [], selectedCategory: categorySlug, selectedMetric: metricId };
	}

	const db = createDb(databaseUrl);

	// Fetch categories
	const categories = await db
		.select()
		.from(demoTrackerCategories)
		.orderBy(demoTrackerCategories.sortOrder);

	// Fetch metrics
	const metrics = await db
		.select({
			id: demoTrackerMetrics.id,
			categoryId: demoTrackerMetrics.categoryId,
			name: demoTrackerMetrics.name,
			slug: demoTrackerMetrics.slug,
			description: demoTrackerMetrics.description,
			unit: demoTrackerMetrics.unit,
			valueType: demoTrackerMetrics.valueType,
			icon: demoTrackerMetrics.icon,
			color: demoTrackerMetrics.color,
			defaultValue: demoTrackerMetrics.defaultValue,
			minValue: demoTrackerMetrics.minValue,
			maxValue: demoTrackerMetrics.maxValue
		})
		.from(demoTrackerMetrics)
		.where(eq(demoTrackerMetrics.archived, false))
		.orderBy(demoTrackerMetrics.sortOrder);

	return { categories, metrics, selectedCategory: categorySlug, selectedMetric: metricId };
};

export const actions: Actions = {
	default: async ({ request, platform }) => {
		const databaseUrl = platform?.env?.DATABASE_URL;
		if (!databaseUrl) {
			return fail(500, { error: 'Database not configured' });
		}

		const formData = await request.formData();
		const metricId = formData.get('metricId') as string;
		const value = formData.get('value') as string;
		const notes = formData.get('notes') as string;
		const dateStr = formData.get('date') as string;

		if (!metricId || !value) {
			return fail(400, { error: 'Metric and value are required' });
		}

		const db = createDb(databaseUrl);

		try {
			// Parse the date or use now
			const date = dateStr ? new Date(dateStr) : new Date();

			await db.insert(demoTrackerEntries).values({
				id: crypto.randomUUID(),
				metricId,
				value,
				notes: notes || null,
				date
			});

			redirect(302, '/modules/tracker');
		} catch (e) {
			console.error('Failed to log entry:', e);
			return fail(500, { error: 'Failed to log entry' });
		}
	}
};
