import { fail, redirect } from '@sveltejs/kit';
import { eq, and, asc } from 'drizzle-orm';
import { createDemoLucia } from '$lib/server/auth';
import { createDb, demoUsers, demoWidgets, demoThingys, demoNotes, demoPhotos } from '$lib/server/db';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params, cookies, platform }) => {
	const { userId, widgetId, thingyId } = params;

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

	// Get the thingy
	const [thingy] = await db
		.select()
		.from(demoThingys)
		.where(and(
			eq(demoThingys.id, thingyId),
			eq(demoThingys.widgetId, widgetId)
		));

	if (!thingy) {
		redirect(302, `/modules/widgets/users/${userId}/widgets/${widgetId}`);
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

	// Fetch notes for this thingy
	const notes = await db
		.select()
		.from(demoNotes)
		.where(eq(demoNotes.thingyId, thingyId))
		.orderBy(asc(demoNotes.sortOrder));

	// Fetch photos for this thingy
	const photos = await db
		.select()
		.from(demoPhotos)
		.where(eq(demoPhotos.thingyId, thingyId))
		.orderBy(asc(demoPhotos.sortOrder));

	const isOwner = currentUser?.id === userId;
	const canEdit = isOwner || currentUser?.admin;

	return {
		widget,
		thingy,
		targetUser,
		currentUser,
		notes,
		photos,
		isOwner,
		canEdit
	};
};

export const actions: Actions = {
	delete: async ({ params, cookies, platform }) => {
		const { userId, widgetId, thingyId } = params;
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

		try {
			await db.delete(demoThingys).where(
				and(
					eq(demoThingys.id, thingyId),
					eq(demoThingys.widgetId, widgetId)
				)
			);
			redirect(302, `/modules/widgets/users/${userId}/widgets/${widgetId}`);
		} catch {
			return fail(500, { error: 'Failed to delete thingy' });
		}
	}
};
