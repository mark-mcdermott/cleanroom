import {
	createDb,
	demoTrackerCategories,
	demoTrackerMetrics,
	demoTrackerEntries,
	demoTrackerGoals
} from '$lib/server/db';
import { desc, eq, and, gte, lte } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const prerender = false;

export const load: PageServerLoad = async ({ platform }) => {
	const databaseUrl = platform?.env?.DATABASE_URL;

	if (!databaseUrl) {
		return { categories: [], todayEntries: [], recentEntries: [], metrics: [], goals: [] };
	}

	const db = createDb(databaseUrl);

	// Get today's date range
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const tomorrow = new Date(today);
	tomorrow.setDate(tomorrow.getDate() + 1);

	// Get 7 days ago for recent entries
	const weekAgo = new Date(today);
	weekAgo.setDate(weekAgo.getDate() - 7);

	// Fetch categories
	const categories = await db
		.select()
		.from(demoTrackerCategories)
		.orderBy(demoTrackerCategories.sortOrder);

	// Fetch metrics with their categories
	const metrics = await db
		.select({
			id: demoTrackerMetrics.id,
			categoryId: demoTrackerMetrics.categoryId,
			name: demoTrackerMetrics.name,
			slug: demoTrackerMetrics.slug,
			unit: demoTrackerMetrics.unit,
			valueType: demoTrackerMetrics.valueType,
			icon: demoTrackerMetrics.icon,
			color: demoTrackerMetrics.color,
			archived: demoTrackerMetrics.archived
		})
		.from(demoTrackerMetrics)
		.where(eq(demoTrackerMetrics.archived, false))
		.orderBy(demoTrackerMetrics.sortOrder);

	// Fetch today's entries
	const todayEntries = await db
		.select({
			id: demoTrackerEntries.id,
			metricId: demoTrackerEntries.metricId,
			value: demoTrackerEntries.value,
			notes: demoTrackerEntries.notes,
			date: demoTrackerEntries.date,
			metricName: demoTrackerMetrics.name,
			metricUnit: demoTrackerMetrics.unit,
			metricIcon: demoTrackerMetrics.icon,
			metricColor: demoTrackerMetrics.color,
			categoryId: demoTrackerMetrics.categoryId
		})
		.from(demoTrackerEntries)
		.leftJoin(demoTrackerMetrics, eq(demoTrackerEntries.metricId, demoTrackerMetrics.id))
		.where(and(gte(demoTrackerEntries.date, today), lte(demoTrackerEntries.date, tomorrow)))
		.orderBy(desc(demoTrackerEntries.date));

	// Fetch recent entries (last 7 days)
	const recentEntries = await db
		.select({
			id: demoTrackerEntries.id,
			metricId: demoTrackerEntries.metricId,
			value: demoTrackerEntries.value,
			notes: demoTrackerEntries.notes,
			date: demoTrackerEntries.date,
			metricName: demoTrackerMetrics.name,
			metricUnit: demoTrackerMetrics.unit,
			metricIcon: demoTrackerMetrics.icon,
			metricColor: demoTrackerMetrics.color
		})
		.from(demoTrackerEntries)
		.leftJoin(demoTrackerMetrics, eq(demoTrackerEntries.metricId, demoTrackerMetrics.id))
		.where(gte(demoTrackerEntries.date, weekAgo))
		.orderBy(desc(demoTrackerEntries.date))
		.limit(20);

	// Fetch active goals
	const goals = await db
		.select({
			id: demoTrackerGoals.id,
			metricId: demoTrackerGoals.metricId,
			targetValue: demoTrackerGoals.targetValue,
			targetType: demoTrackerGoals.targetType,
			comparison: demoTrackerGoals.comparison
		})
		.from(demoTrackerGoals)
		.where(eq(demoTrackerGoals.active, true));

	return { categories, metrics, todayEntries, recentEntries, goals };
};
