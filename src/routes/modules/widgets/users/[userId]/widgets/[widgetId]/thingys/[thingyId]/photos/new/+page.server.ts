import { fail, redirect } from '@sveltejs/kit';
import { generateIdFromEntropySize } from 'lucia';
import { eq, and, count } from 'drizzle-orm';
import { createDemoLucia } from '$lib/server/auth';
import { createDb, demoUsers, demoWidgets, demoThingys, demoPhotos } from '$lib/server/db';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params, cookies, platform }) => {
	const { userId, widgetId, thingyId } = params;

	if (!platform?.env?.DATABASE_URL) redirect(302, '/modules/widgets');

	const db = createDb(platform.env.DATABASE_URL);

	const [widget] = await db.select().from(demoWidgets)
		.where(and(eq(demoWidgets.id, widgetId), eq(demoWidgets.userId, userId)));
	if (!widget) redirect(302, `/modules/widgets/users/${userId}/widgets`);

	const [thingy] = await db.select().from(demoThingys)
		.where(and(eq(demoThingys.id, thingyId), eq(demoThingys.widgetId, widgetId)));
	if (!thingy) redirect(302, `/modules/widgets/users/${userId}/widgets/${widgetId}`);

	const [targetUser] = await db.select({ id: demoUsers.id, name: demoUsers.name })
		.from(demoUsers).where(eq(demoUsers.id, userId));

	const sessionId = cookies.get('demo_auth_session');
	let currentUser = null;
	if (sessionId) {
		const lucia = createDemoLucia(db);
		const { user } = await lucia.validateSession(sessionId);
		if (user) currentUser = { id: user.id, admin: user.admin };
	}

	const canEdit = currentUser?.id === userId || currentUser?.admin;
	if (!canEdit) redirect(302, `/modules/widgets/users/${userId}/widgets/${widgetId}/thingys/${thingyId}`);

	return { widget, thingy, targetUser };
};

export const actions: Actions = {
	default: async ({ request, params, cookies, platform }) => {
		const { userId, widgetId, thingyId } = params;
		const sessionId = cookies.get('demo_auth_session');

		if (!sessionId || !platform?.env?.DATABASE_URL) return fail(401, { error: 'Not authenticated' });

		const db = createDb(platform.env.DATABASE_URL);
		const lucia = createDemoLucia(db);
		const { user } = await lucia.validateSession(sessionId);

		if (!user || (user.id !== userId && !user.admin)) return fail(403, { error: 'Not authorized' });

		const formData = await request.formData();
		const photo = formData.get('photo') as File;
		const caption = formData.get('caption') as string;

		if (!photo || photo.size === 0) return fail(400, { error: 'Photo is required', caption });

		const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
		if (!allowedTypes.includes(photo.type)) return fail(400, { error: 'Invalid file type', caption });
		if (photo.size > 5 * 1024 * 1024) return fail(400, { error: 'File too large (max 5MB)', caption });

		try {
			const photoId = generateIdFromEntropySize(10);
			let url = '';

			if (platform?.env?.WIDGET_PHOTOS) {
				const arrayBuffer = await photo.arrayBuffer();
				await platform.env.WIDGET_PHOTOS.put(`photos/${photoId}`, arrayBuffer, {
					httpMetadata: { contentType: photo.type }
				});
				url = `/api/widgets/photos/${photoId}`;
			} else {
				const arrayBuffer = await photo.arrayBuffer();
				const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
				url = `data:${photo.type};base64,${base64}`;
			}

			const [{ total }] = await db.select({ total: count() }).from(demoPhotos)
				.where(eq(demoPhotos.thingyId, thingyId));

			await db.insert(demoPhotos).values({
				id: photoId, thingyId, url,
				caption: caption?.trim() || null,
				filename: photo.name, mimeType: photo.type,
				sortOrder: String(total)
			});

			redirect(302, `/modules/widgets/users/${userId}/widgets/${widgetId}/thingys/${thingyId}`);
		} catch {
			return fail(500, { error: 'Failed to upload photo', caption });
		}
	}
};
