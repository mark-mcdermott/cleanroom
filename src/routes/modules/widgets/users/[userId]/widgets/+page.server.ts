import { fail, redirect } from '@sveltejs/kit';
import { generateIdFromEntropySize } from 'lucia';
import { eq, and, asc } from 'drizzle-orm';
import { createDemoLucia } from '$lib/server/auth';
import { createDb, demoUsers, demoWidgets, demoSessions } from '$lib/server/db';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params, cookies, platform }) => {
	const { userId } = params;

	if (!platform?.env?.DATABASE_URL) {
		redirect(302, '/modules/widgets');
	}

	const db = createDb(platform.env.DATABASE_URL);

	// Get the user whose widgets we're viewing
	const [targetUser] = await db
		.select({
			id: demoUsers.id,
			name: demoUsers.name,
			email: demoUsers.email
		})
		.from(demoUsers)
		.where(eq(demoUsers.id, userId));

	if (!targetUser) {
		redirect(302, '/modules/widgets');
	}

	// Get current logged-in user
	const sessionId = cookies.get('demo_auth_session');
	let currentUser = null;

	if (sessionId) {
		const lucia = createDemoLucia(db);
		const { user } = await lucia.validateSession(sessionId);
		if (user) {
			currentUser = {
				id: user.id,
				name: user.name,
				email: user.email,
				admin: user.admin
			};
		}
	}

	// Fetch widgets for this user
	const widgets = await db
		.select({
			id: demoWidgets.id,
			name: demoWidgets.name,
			description: demoWidgets.description,
			createdAt: demoWidgets.createdAt,
			updatedAt: demoWidgets.updatedAt
		})
		.from(demoWidgets)
		.where(eq(demoWidgets.userId, userId))
		.orderBy(asc(demoWidgets.name));

	const isOwner = currentUser?.id === userId;
	const canEdit = isOwner || currentUser?.admin;

	return {
		targetUser,
		currentUser,
		widgets,
		isOwner,
		canEdit
	};
};

export const actions: Actions = {
	delete: async ({ request, params, cookies, platform }) => {
		const { userId } = params;
		const sessionId = cookies.get('demo_auth_session');

		if (!sessionId || !platform?.env?.DATABASE_URL) {
			return fail(401, { error: 'Not authenticated' });
		}

		const db = createDb(platform.env.DATABASE_URL);
		const lucia = createDemoLucia(db);
		const { user } = await lucia.validateSession(sessionId);

		if (!user) {
			return fail(401, { error: 'Not authenticated' });
		}

		// Check permission: must be owner or admin
		if (user.id !== userId && !user.admin) {
			return fail(403, { error: 'Not authorized' });
		}

		const formData = await request.formData();
		const widgetId = formData.get('widgetId') as string;

		if (!widgetId) {
			return fail(400, { error: 'Widget ID is required' });
		}

		try {
			// Delete the widget (cascade will handle related items)
			await db.delete(demoWidgets).where(
				and(
					eq(demoWidgets.id, widgetId),
					eq(demoWidgets.userId, userId)
				)
			);
			return { success: true };
		} catch {
			return fail(500, { error: 'Failed to delete widget' });
		}
	},

	reset: async ({ params, cookies, platform }) => {
		const { userId } = params;

		if (!platform?.env?.DATABASE_URL) {
			return fail(500, { error: 'Database not configured' });
		}

		const db = createDb(platform.env.DATABASE_URL);

		// Delete all widgets for this user
		await db.delete(demoWidgets).where(eq(demoWidgets.userId, userId));

		// Create sample widgets
		const sampleWidgets = [
			{ name: 'My First Widget', description: 'This is a sample widget to get you started.' },
			{ name: 'Project Tracker', description: 'Track your projects and tasks.' },
			{ name: 'Ideas Board', description: 'Capture and organize your ideas.' }
		];

		for (const widget of sampleWidgets) {
			await db.insert(demoWidgets).values({
				id: generateIdFromEntropySize(10),
				userId,
				name: widget.name,
				description: widget.description
			});
		}

		return { success: true };
	}
};
