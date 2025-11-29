import { fail } from '@sveltejs/kit';
import { desc, eq } from 'drizzle-orm';
import {
	createDb,
	demoTrackerCategories,
	demoTrackerMetrics,
	demoTrackerEntries,
	demoTrackerGoals
} from '$lib/server/db';
import type { PageServerLoad, Actions } from './$types';

export const prerender = false;

export const load: PageServerLoad = async ({ platform }) => {
	const databaseUrl = platform?.env?.DATABASE_URL;
	if (!databaseUrl) {
		return { categories: [], metrics: [] };
	}

	const db = createDb(databaseUrl);

	const categories = await db
		.select()
		.from(demoTrackerCategories)
		.orderBy(demoTrackerCategories.sortOrder);

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
			archived: demoTrackerMetrics.archived,
			createdAt: demoTrackerMetrics.createdAt
		})
		.from(demoTrackerMetrics)
		.orderBy(demoTrackerMetrics.sortOrder);

	return { categories, metrics };
};

export const actions: Actions = {
	deleteMetric: async ({ request, platform }) => {
		const databaseUrl = platform?.env?.DATABASE_URL;
		if (!databaseUrl) {
			return fail(500, { error: 'Database not configured' });
		}

		const formData = await request.formData();
		const metricId = formData.get('metricId') as string;

		if (!metricId) {
			return fail(400, { error: 'Metric ID is required' });
		}

		const db = createDb(databaseUrl);

		try {
			await db.delete(demoTrackerMetrics).where(eq(demoTrackerMetrics.id, metricId));
			return { success: true };
		} catch {
			return fail(500, { error: 'Failed to delete metric' });
		}
	},

	deleteCategory: async ({ request, platform }) => {
		const databaseUrl = platform?.env?.DATABASE_URL;
		if (!databaseUrl) {
			return fail(500, { error: 'Database not configured' });
		}

		const formData = await request.formData();
		const categoryId = formData.get('categoryId') as string;

		if (!categoryId) {
			return fail(400, { error: 'Category ID is required' });
		}

		const db = createDb(databaseUrl);

		try {
			await db.delete(demoTrackerCategories).where(eq(demoTrackerCategories.id, categoryId));
			return { success: true };
		} catch {
			return fail(500, { error: 'Failed to delete category' });
		}
	},

	reset: async ({ platform }) => {
		const databaseUrl = platform?.env?.DATABASE_URL;
		if (!databaseUrl) {
			return fail(500, { error: 'Database not configured' });
		}

		const db = createDb(databaseUrl);

		try {
			// Clear existing data
			await db.delete(demoTrackerGoals);
			await db.delete(demoTrackerEntries);
			await db.delete(demoTrackerMetrics);
			await db.delete(demoTrackerCategories);

			// Create categories
			const categories = [
				{ id: 'cat-exercise', name: 'Exercise', slug: 'exercise', description: 'Track your physical activity', icon: '🏃', color: '#10b981', sortOrder: '1' },
				{ id: 'cat-diet', name: 'Diet', slug: 'diet', description: 'Monitor your nutrition', icon: '🥗', color: '#f59e0b', sortOrder: '2' },
				{ id: 'cat-sleep', name: 'Sleep', slug: 'sleep', description: 'Track your sleep patterns', icon: '😴', color: '#8b5cf6', sortOrder: '3' },
				{ id: 'cat-mood', name: 'Mood', slug: 'mood', description: 'Monitor your emotional wellbeing', icon: '😊', color: '#ec4899', sortOrder: '4' },
				{ id: 'cat-health', name: 'Health', slug: 'health', description: 'Track health metrics', icon: '❤️', color: '#ef4444', sortOrder: '5' }
			];

			for (const cat of categories) {
				await db.insert(demoTrackerCategories).values(cat);
			}

			// Create metrics
			const metrics = [
				// Exercise
				{ id: 'metric-steps', categoryId: 'cat-exercise', name: 'Steps', slug: 'steps', unit: 'steps', valueType: 'number', icon: '👟', color: '#10b981', sortOrder: '1' },
				{ id: 'metric-workout', categoryId: 'cat-exercise', name: 'Workout Duration', slug: 'workout-duration', unit: 'min', valueType: 'number', icon: '💪', color: '#10b981', sortOrder: '2' },
				{ id: 'metric-calories-burned', categoryId: 'cat-exercise', name: 'Calories Burned', slug: 'calories-burned', unit: 'cal', valueType: 'number', icon: '🔥', color: '#10b981', sortOrder: '3' },
				// Diet
				{ id: 'metric-calories', categoryId: 'cat-diet', name: 'Calories', slug: 'calories', unit: 'cal', valueType: 'number', icon: '🍎', color: '#f59e0b', sortOrder: '1' },
				{ id: 'metric-water', categoryId: 'cat-diet', name: 'Water', slug: 'water', unit: 'glasses', valueType: 'number', icon: '💧', color: '#3b82f6', sortOrder: '2' },
				{ id: 'metric-protein', categoryId: 'cat-diet', name: 'Protein', slug: 'protein', unit: 'g', valueType: 'number', icon: '🥩', color: '#f59e0b', sortOrder: '3' },
				// Sleep
				{ id: 'metric-sleep-hours', categoryId: 'cat-sleep', name: 'Hours of Sleep', slug: 'sleep-hours', unit: 'hrs', valueType: 'number', icon: '🛏️', color: '#8b5cf6', sortOrder: '1' },
				{ id: 'metric-sleep-quality', categoryId: 'cat-sleep', name: 'Sleep Quality', slug: 'sleep-quality', unit: '/5', valueType: 'rating', icon: '⭐', color: '#8b5cf6', sortOrder: '2' },
				// Mood
				{ id: 'metric-mood', categoryId: 'cat-mood', name: 'Mood', slug: 'mood', unit: '/5', valueType: 'rating', icon: '😊', color: '#ec4899', sortOrder: '1' },
				{ id: 'metric-stress', categoryId: 'cat-mood', name: 'Stress Level', slug: 'stress', unit: '/5', valueType: 'rating', icon: '😰', color: '#ec4899', sortOrder: '2' },
				// Health
				{ id: 'metric-weight', categoryId: 'cat-health', name: 'Weight', slug: 'weight', unit: 'lbs', valueType: 'number', icon: '⚖️', color: '#ef4444', sortOrder: '1' },
				{ id: 'metric-blood-pressure', categoryId: 'cat-health', name: 'Blood Pressure', slug: 'blood-pressure', unit: 'mmHg', valueType: 'text', icon: '🩺', color: '#ef4444', sortOrder: '2' }
			];

			for (const metric of metrics) {
				await db.insert(demoTrackerMetrics).values(metric);
			}

			// Create goals
			const goals = [
				{ id: 'goal-steps', metricId: 'metric-steps', targetValue: '10000', targetType: 'daily', comparison: 'gte' },
				{ id: 'goal-water', metricId: 'metric-water', targetValue: '8', targetType: 'daily', comparison: 'gte' },
				{ id: 'goal-sleep', metricId: 'metric-sleep-hours', targetValue: '8', targetType: 'daily', comparison: 'gte' },
				{ id: 'goal-workout', metricId: 'metric-workout', targetValue: '30', targetType: 'daily', comparison: 'gte' }
			];

			for (const goal of goals) {
				await db.insert(demoTrackerGoals).values(goal);
			}

			// Add some sample entries for the last few days
			const now = new Date();
			const entries = [];

			// Yesterday's entries
			const yesterday = new Date(now);
			yesterday.setDate(yesterday.getDate() - 1);
			yesterday.setHours(8, 0, 0, 0);
			entries.push(
				{ id: crypto.randomUUID(), metricId: 'metric-steps', value: '8500', date: new Date(yesterday) },
				{ id: crypto.randomUUID(), metricId: 'metric-water', value: '7', date: new Date(yesterday) },
				{ id: crypto.randomUUID(), metricId: 'metric-sleep-hours', value: '7.5', date: new Date(yesterday) },
				{ id: crypto.randomUUID(), metricId: 'metric-mood', value: '4', date: new Date(yesterday) }
			);

			// Day before yesterday
			const twoDaysAgo = new Date(now);
			twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
			twoDaysAgo.setHours(9, 0, 0, 0);
			entries.push(
				{ id: crypto.randomUUID(), metricId: 'metric-steps', value: '12000', date: new Date(twoDaysAgo) },
				{ id: crypto.randomUUID(), metricId: 'metric-workout', value: '45', date: new Date(twoDaysAgo) },
				{ id: crypto.randomUUID(), metricId: 'metric-water', value: '8', date: new Date(twoDaysAgo) },
				{ id: crypto.randomUUID(), metricId: 'metric-sleep-hours', value: '8', date: new Date(twoDaysAgo) }
			);

			// Today's entries
			const today = new Date(now);
			today.setHours(7, 30, 0, 0);
			entries.push(
				{ id: crypto.randomUUID(), metricId: 'metric-sleep-hours', value: '7', date: new Date(today) },
				{ id: crypto.randomUUID(), metricId: 'metric-mood', value: '4', notes: 'Feeling good!', date: new Date(today) }
			);
			today.setHours(12, 0, 0, 0);
			entries.push(
				{ id: crypto.randomUUID(), metricId: 'metric-steps', value: '5200', date: new Date(today) },
				{ id: crypto.randomUUID(), metricId: 'metric-water', value: '4', date: new Date(today) }
			);

			for (const entry of entries) {
				await db.insert(demoTrackerEntries).values(entry);
			}

			return { success: true, message: 'Demo data reset successfully' };
		} catch (e) {
			console.error('Failed to reset demo data:', e);
			return fail(500, { error: 'Failed to reset demo data' });
		}
	}
};
