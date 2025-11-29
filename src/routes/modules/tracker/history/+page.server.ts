import { fail } from '@sveltejs/kit';
import {
	createDb,
	demoTrackerCategories,
	demoTrackerMetrics,
	demoTrackerEntries
} from '$lib/server/db';
import { desc, eq } from 'drizzle-orm';
import type { PageServerLoad, Actions } from './$types';

export const prerender = false;

export const load: PageServerLoad = async ({ platform, url }) => {
	const databaseUrl = platform?.env?.DATABASE_URL;
	const metricFilter = url.searchParams.get('metric');

	if (!databaseUrl) {
		return { entries: [], categories: [], metrics: [], selectedMetric: metricFilter };
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
			unit: demoTrackerMetrics.unit,
			icon: demoTrackerMetrics.icon,
			color: demoTrackerMetrics.color
		})
		.from(demoTrackerMetrics)
		.where(eq(demoTrackerMetrics.archived, false))
		.orderBy(demoTrackerMetrics.sortOrder);

	// Build entries query
	let entriesQuery = db
		.select({
			id: demoTrackerEntries.id,
			metricId: demoTrackerEntries.metricId,
			value: demoTrackerEntries.value,
			notes: demoTrackerEntries.notes,
			date: demoTrackerEntries.date,
			createdAt: demoTrackerEntries.createdAt,
			metricName: demoTrackerMetrics.name,
			metricUnit: demoTrackerMetrics.unit,
			metricIcon: demoTrackerMetrics.icon,
			metricColor: demoTrackerMetrics.color,
			categoryId: demoTrackerMetrics.categoryId
		})
		.from(demoTrackerEntries)
		.leftJoin(demoTrackerMetrics, eq(demoTrackerEntries.metricId, demoTrackerMetrics.id))
		.orderBy(desc(demoTrackerEntries.date))
		.limit(100);

	let entries = await entriesQuery;

	// Apply metric filter if specified
	if (metricFilter) {
		entries = entries.filter((e) => e.metricId === metricFilter);
	}

	return { entries, categories, metrics, selectedMetric: metricFilter };
};

export const actions: Actions = {
	delete: async ({ request, platform }) => {
		const databaseUrl = platform?.env?.DATABASE_URL;
		if (!databaseUrl) {
			return fail(500, { error: 'Database not configured' });
		}

		const formData = await request.formData();
		const entryId = formData.get('entryId') as string;

		if (!entryId) {
			return fail(400, { error: 'Entry ID is required' });
		}

		const db = createDb(databaseUrl);

		try {
			await db.delete(demoTrackerEntries).where(eq(demoTrackerEntries.id, entryId));
			return { success: true };
		} catch {
			return fail(500, { error: 'Failed to delete entry' });
		}
	}
};
