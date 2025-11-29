import { fail, redirect } from '@sveltejs/kit';
import { generateIdFromEntropySize } from 'lucia';
import { eq, and, asc } from 'drizzle-orm';
import { createDemoLucia } from '$lib/server/auth';
import { createDb, demoUsers, demoWidgets, demoGalleries, demoPhotos } from '$lib/server/db';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params, cookies, platform }) => {
	const { userId, widgetId } = params;

	if (!platform?.env?.DATABASE_URL) redirect(302, '/modules/widgets');

	const db = createDb(platform.env.DATABASE_URL);

	const [widget] = await db.select().from(demoWidgets)
		.where(and(eq(demoWidgets.id, widgetId), eq(demoWidgets.userId, userId)));
	if (!widget) redirect(302, `/modules/widgets/users/${userId}/widgets`);

	const [targetUser] = await db.select({ id: demoUsers.id, name: demoUsers.name })
		.from(demoUsers).where(eq(demoUsers.id, userId));

	// Get or create gallery
	let [gallery] = await db.select().from(demoGalleries)
		.where(eq(demoGalleries.widgetId, widgetId));

	// Get gallery photos
	const photos = gallery ? await db.select().from(demoPhotos)
		.where(eq(demoPhotos.galleryId, gallery.id))
		.orderBy(asc(demoPhotos.sortOrder)) : [];

	const sessionId = cookies.get('demo_auth_session');
	let currentUser = null;
	if (sessionId) {
		const lucia = createDemoLucia(db);
		const { user } = await lucia.validateSession(sessionId);
		if (user) currentUser = { id: user.id, admin: user.admin };
	}

	return { widget, targetUser, gallery, photos, canEdit: currentUser?.id === userId || currentUser?.admin };
};

export const actions: Actions = {
	createGallery: async ({ params, cookies, platform }) => {
		const { userId, widgetId } = params;
		const sessionId = cookies.get('demo_auth_session');

		if (!sessionId || !platform?.env?.DATABASE_URL) return fail(401, { error: 'Not authenticated' });

		const db = createDb(platform.env.DATABASE_URL);
		const lucia = createDemoLucia(db);
		const { user } = await lucia.validateSession(sessionId);

		if (!user || (user.id !== userId && !user.admin)) return fail(403, { error: 'Not authorized' });

		try {
			await db.insert(demoGalleries).values({
				id: generateIdFromEntropySize(10),
				widgetId,
				name: 'Gallery'
			});
			return { success: true };
		} catch {
			return fail(500, { error: 'Failed to create gallery' });
		}
	},

	addPhoto: async ({ request, params, cookies, platform }) => {
		const { userId, widgetId } = params;
		const sessionId = cookies.get('demo_auth_session');

		if (!sessionId || !platform?.env?.DATABASE_URL) return fail(401, { error: 'Not authenticated' });

		const db = createDb(platform.env.DATABASE_URL);
		const lucia = createDemoLucia(db);
		const { user } = await lucia.validateSession(sessionId);

		if (!user || (user.id !== userId && !user.admin)) return fail(403, { error: 'Not authorized' });

		const formData = await request.formData();
		const photo = formData.get('photo') as File;
		const caption = formData.get('caption') as string;
		const galleryId = formData.get('galleryId') as string;

		if (!photo || photo.size === 0) return fail(400, { error: 'Photo is required' });
		if (!galleryId) return fail(400, { error: 'Gallery not found' });

		const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
		if (!allowedTypes.includes(photo.type)) return fail(400, { error: 'Invalid file type' });
		if (photo.size > 5 * 1024 * 1024) return fail(400, { error: 'File too large' });

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

			const existingPhotos = await db.select().from(demoPhotos).where(eq(demoPhotos.galleryId, galleryId));

			await db.insert(demoPhotos).values({
				id: photoId, galleryId, url,
				caption: caption?.trim() || null,
				filename: photo.name, mimeType: photo.type,
				sortOrder: String(existingPhotos.length)
			});

			return { success: true };
		} catch {
			return fail(500, { error: 'Failed to add photo' });
		}
	},

	removePhoto: async ({ request, params, cookies, platform }) => {
		const { userId } = params;
		const sessionId = cookies.get('demo_auth_session');

		if (!sessionId || !platform?.env?.DATABASE_URL) return fail(401, { error: 'Not authenticated' });

		const db = createDb(platform.env.DATABASE_URL);
		const lucia = createDemoLucia(db);
		const { user } = await lucia.validateSession(sessionId);

		if (!user || (user.id !== userId && !user.admin)) return fail(403, { error: 'Not authorized' });

		const formData = await request.formData();
		const photoId = formData.get('photoId') as string;

		if (!photoId) return fail(400, { error: 'Photo ID required' });

		try {
			if (platform?.env?.WIDGET_PHOTOS) await platform.env.WIDGET_PHOTOS.delete(`photos/${photoId}`);
			await db.delete(demoPhotos).where(eq(demoPhotos.id, photoId));
			return { success: true };
		} catch {
			return fail(500, { error: 'Failed to remove photo' });
		}
	}
};
