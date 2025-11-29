import { error } from '@sveltejs/kit';
import { eq, desc, and, gte } from 'drizzle-orm';
import {
	createDb,
	demoTrackerMetrics,
	demoTrackerCategories,
	demoTrackerEntries,
	demoTrackerGoals
} from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const prerender = false;

export const load: PageServerLoad = async ({ platform, params }) => {
	const databaseUrl = platform?.env?.DATABASE_URL;
	if (!databaseUrl) {
		throw error(500, 'Database not configured');
	}

	const db = createDb(databaseUrl);

	// Fetch metric with category
	const [metric] = await db
		.select({
			id: demoTrackerMetrics.id,
			categoryId: demoTrackerMetrics.categoryId,
			name: demoTrackerMetrics.name,
			slug: demoTrackerMetrics.slug,
			unit: demoTrackerMetrics.unit,
			valueType: demoTrackerMetrics.valueType,
			icon: demoTrackerMetrics.icon,
			color: demoTrackerMetrics.color,
			description: demoTrackerMetrics.description,
			archived: demoTrackerMetrics.archived,
			categoryName: demoTrackerCategories.name,
			categoryIcon: demoTrackerCategories.icon
		})
		.from(demoTrackerMetrics)
		.leftJoin(demoTrackerCategories, eq(demoTrackerMetrics.categoryId, demoTrackerCategories.id))
		.where(eq(demoTrackerMetrics.id, params.id))
		.limit(1);

	if (!metric) {
		throw error(404, 'Metric not found');
	}

	// Fetch goal for this metric
	const [goal] = await db
		.select()
		.from(demoTrackerGoals)
		.where(and(eq(demoTrackerGoals.metricId, params.id), eq(demoTrackerGoals.active, true)))
		.limit(1);

	// Fetch recent entries (last 30 days)
	const thirtyDaysAgo = new Date();
	thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

	const entries = await db
		.select()
		.from(demoTrackerEntries)
		.where(
			and(eq(demoTrackerEntries.metricId, params.id), gte(demoTrackerEntries.date, thirtyDaysAgo))
		)
		.orderBy(desc(demoTrackerEntries.date))
		.limit(100);

	// Calculate statistics
	const numericEntries = entries
		.map((e) => parseFloat(e.value))
		.filter((v) => !isNaN(v));

	const stats = {
		total: entries.length,
		average: numericEntries.length > 0
			? (numericEntries.reduce((a, b) => a + b, 0) / numericEntries.length).toFixed(1)
			: null,
		min: numericEntries.length > 0 ? Math.min(...numericEntries) : null,
		max: numericEntries.length > 0 ? Math.max(...numericEntries) : null,
		latest: entries[0]?.value || null
	};

	// Calculate today's progress toward goal
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const todayEntries = entries.filter((e) => {
		const entryDate = new Date(e.date);
		entryDate.setHours(0, 0, 0, 0);
		return entryDate.getTime() === today.getTime();
	});
	const todayTotal = todayEntries.reduce((sum, e) => sum + parseFloat(e.value || '0'), 0);

	return {
		metric,
		goal,
		entries,
		stats,
		todayTotal,
		goalProgress: goal ? (todayTotal / parseFloat(goal.targetValue)) * 100 : null
	};
};
