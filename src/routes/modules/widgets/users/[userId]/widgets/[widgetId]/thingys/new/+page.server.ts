import { fail, redirect } from '@sveltejs/kit';
import { generateIdFromEntropySize } from 'lucia';
import { eq, and, count } from 'drizzle-orm';
import { createDemoLucia } from '$lib/server/auth';
import { createDb, demoUsers, demoWidgets, demoThingys } from '$lib/server/db';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params, cookies, platform }) => {
	const { userId, widgetId } = params;

	if (!platform?.env?.DATABASE_URL) {
		redirect(302, '/modules/widgets');
	}

	const db = createDb(platform.env.DATABASE_URL);

	// Get the widget
	const [widget] = await db
		.select()
		.from(demoWidgets)
		.where(and(
			eq(demoWidgets.id, widgetId),
			eq(demoWidgets.userId, userId)
		));

	if (!widget) {
		redirect(302, `/modules/widgets/users/${userId}/widgets`);
	}

	// Get the owner user
	const [targetUser] = await db
		.select({
			id: demoUsers.id,
			name: demoUsers.name,
			email: demoUsers.email
		})
		.from(demoUsers)
		.where(eq(demoUsers.id, userId));

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

	// Check permission
	const canEdit = currentUser?.id === userId || currentUser?.admin;
	if (!canEdit) {
		redirect(302, `/modules/widgets/users/${userId}/widgets/${widgetId}`);
	}

	return {
		widget,
		targetUser,
		currentUser
	};
};

export const actions: Actions = {
	default: async ({ request, params, cookies, platform }) => {
		const { userId, widgetId } = params;
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

		if (user.id !== userId && !user.admin) {
			return fail(403, { error: 'Not authorized' });
		}

		const formData = await request.formData();
		const name = formData.get('name') as string;
		const description = formData.get('description') as string;

		if (!name?.trim()) {
			return fail(400, { error: 'Name is required', name, description });
		}

		try {
			// Get current count for sort order
			const [{ total }] = await db
				.select({ total: count() })
				.from(demoThingys)
				.where(eq(demoThingys.widgetId, widgetId));

			const thingyId = generateIdFromEntropySize(10);
			await db.insert(demoThingys).values({
				id: thingyId,
				widgetId,
				name: name.trim(),
				description: description?.trim() || null,
				sortOrder: String(total)
			});
			redirect(302, `/modules/widgets/users/${userId}/widgets/${widgetId}/thingys/${thingyId}`);
		} catch {
			return fail(500, { error: 'Failed to create thingy', name, description });
		}
	}
};
