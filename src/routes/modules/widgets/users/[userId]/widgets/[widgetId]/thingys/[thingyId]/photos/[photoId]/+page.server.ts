import { fail, redirect } from '@sveltejs/kit';
import { eq, and } from 'drizzle-orm';
import { createDemoLucia } from '$lib/server/auth';
import { createDb, demoUsers, demoWidgets, demoThingys, demoPhotos } from '$lib/server/db';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params, cookies, platform }) => {
	const { userId, widgetId, thingyId, photoId } = params;

	if (!platform?.env?.DATABASE_URL) redirect(302, '/modules/widgets');

	const db = createDb(platform.env.DATABASE_URL);

	const [widget] = await db.select().from(demoWidgets)
		.where(and(eq(demoWidgets.id, widgetId), eq(demoWidgets.userId, userId)));
	if (!widget) redirect(302, `/modules/widgets/users/${userId}/widgets`);

	const [thingy] = await db.select().from(demoThingys)
		.where(and(eq(demoThingys.id, thingyId), eq(demoThingys.widgetId, widgetId)));
	if (!thingy) redirect(302, `/modules/widgets/users/${userId}/widgets/${widgetId}`);

	const [photo] = await db.select().from(demoPhotos)
		.where(and(eq(demoPhotos.id, photoId), eq(demoPhotos.thingyId, thingyId)));
	if (!photo) redirect(302, `/modules/widgets/users/${userId}/widgets/${widgetId}/thingys/${thingyId}`);

	const [targetUser] = await db.select({ id: demoUsers.id, name: demoUsers.name })
		.from(demoUsers).where(eq(demoUsers.id, userId));

	const sessionId = cookies.get('demo_auth_session');
	let currentUser = null;
	if (sessionId) {
		const lucia = createDemoLucia(db);
		const { user } = await lucia.validateSession(sessionId);
		if (user) currentUser = { id: user.id, admin: user.admin };
	}

	return { widget, thingy, photo, targetUser, canEdit: currentUser?.id === userId || currentUser?.admin };
};

export const actions: Actions = {
	delete: async ({ params, cookies, platform }) => {
		const { userId, widgetId, thingyId, photoId } = params;
		const sessionId = cookies.get('demo_auth_session');

		if (!sessionId || !platform?.env?.DATABASE_URL) return fail(401, { error: 'Not authenticated' });

		const db = createDb(platform.env.DATABASE_URL);
		const lucia = createDemoLucia(db);
		const { user } = await lucia.validateSession(sessionId);

		if (!user || (user.id !== userId && !user.admin)) return fail(403, { error: 'Not authorized' });

		try {
			if (platform?.env?.WIDGET_PHOTOS) await platform.env.WIDGET_PHOTOS.delete(`photos/${photoId}`);
			await db.delete(demoPhotos).where(and(eq(demoPhotos.id, photoId), eq(demoPhotos.thingyId, thingyId)));
			redirect(302, `/modules/widgets/users/${userId}/widgets/${widgetId}/thingys/${thingyId}`);
		} catch {
			return fail(500, { error: 'Failed to delete photo' });
		}
	}
};
