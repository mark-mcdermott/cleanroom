import { fail, redirect } from '@sveltejs/kit';
import { generateIdFromEntropySize } from 'lucia';
import { eq, and, count } from 'drizzle-orm';
import { createDemoLucia } from '$lib/server/auth';
import { createDb, demoUsers, demoWidgets, demoPhotos } from '$lib/server/db';
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

	const sessionId = cookies.get('demo_auth_session');
	let currentUser = null;
	if (sessionId) {
		const lucia = createDemoLucia(db);
		const { user } = await lucia.validateSession(sessionId);
		if (user) currentUser = { id: user.id, admin: user.admin };
	}

	const canEdit = currentUser?.id === userId || currentUser?.admin;
	if (!canEdit) redirect(302, `/modules/widgets/users/${userId}/widgets/${widgetId}`);

	return { widget, targetUser };
};

export const actions: Actions = {
	default: async ({ request, params, cookies, platform }) => {
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

		if (!photo || photo.size === 0) {
			return fail(400, { error: 'Photo is required', caption });
		}

		// Validate file type
		const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
		if (!allowedTypes.includes(photo.type)) {
			return fail(400, { error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.', caption });
		}

		// Max 5MB
		if (photo.size > 5 * 1024 * 1024) {
			return fail(400, { error: 'File too large. Maximum 5MB allowed.', caption });
		}

		try {
			const photoId = generateIdFromEntropySize(10);

			// Upload to R2 if available
			let url = '';
			if (platform?.env?.WIDGET_PHOTOS) {
				const arrayBuffer = await photo.arrayBuffer();
				await platform.env.WIDGET_PHOTOS.put(`photos/${photoId}`, arrayBuffer, {
					httpMetadata: { contentType: photo.type }
				});
				url = `/api/widgets/photos/${photoId}`;
			} else {
				// Fallback: store as data URL for demo (not recommended for production)
				const arrayBuffer = await photo.arrayBuffer();
				const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
				url = `data:${photo.type};base64,${base64}`;
			}

			const [{ total }] = await db.select({ total: count() }).from(demoPhotos)
				.where(eq(demoPhotos.widgetId, widgetId));

			await db.insert(demoPhotos).values({
				id: photoId,
				widgetId,
				url,
				caption: caption?.trim() || null,
				filename: photo.name,
				mimeType: photo.type,
				sortOrder: String(total)
			});

			redirect(302, `/modules/widgets/users/${userId}/widgets/${widgetId}`);
		} catch {
			return fail(500, { error: 'Failed to upload photo', caption });
		}
	}
};
