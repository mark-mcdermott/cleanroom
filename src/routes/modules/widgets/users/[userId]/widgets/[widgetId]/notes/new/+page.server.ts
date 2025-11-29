import { fail, redirect } from '@sveltejs/kit';
import { generateIdFromEntropySize } from 'lucia';
import { eq, and, count } from 'drizzle-orm';
import { createDemoLucia } from '$lib/server/auth';
import { createDb, demoUsers, demoWidgets, demoNotes } from '$lib/server/db';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params, cookies, platform }) => {
	const { userId, widgetId } = params;

	if (!platform?.env?.DATABASE_URL) {
		redirect(302, '/modules/widgets');
	}

	const db = createDb(platform.env.DATABASE_URL);

	const [widget] = await db.select().from(demoWidgets)
		.where(and(eq(demoWidgets.id, widgetId), eq(demoWidgets.userId, userId)));

	if (!widget) {
		redirect(302, `/modules/widgets/users/${userId}/widgets`);
	}

	const [targetUser] = await db.select({ id: demoUsers.id, name: demoUsers.name, email: demoUsers.email })
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

		if (!sessionId || !platform?.env?.DATABASE_URL) {
			return fail(401, { error: 'Not authenticated' });
		}

		const db = createDb(platform.env.DATABASE_URL);
		const lucia = createDemoLucia(db);
		const { user } = await lucia.validateSession(sessionId);

		if (!user || (user.id !== userId && !user.admin)) {
			return fail(403, { error: 'Not authorized' });
		}

		const formData = await request.formData();
		const content = formData.get('content') as string;

		if (!content?.trim()) {
			return fail(400, { error: 'Content is required', content });
		}

		try {
			const [{ total }] = await db.select({ total: count() }).from(demoNotes)
				.where(eq(demoNotes.widgetId, widgetId));

			const noteId = generateIdFromEntropySize(10);
			await db.insert(demoNotes).values({
				id: noteId,
				widgetId,
				content: content.trim(),
				sortOrder: String(total)
			});
			redirect(302, `/modules/widgets/users/${userId}/widgets/${widgetId}`);
		} catch {
			return fail(500, { error: 'Failed to create note', content });
		}
	}
};
