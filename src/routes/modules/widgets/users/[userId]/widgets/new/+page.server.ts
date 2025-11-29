import { fail, redirect } from '@sveltejs/kit';
import { generateIdFromEntropySize } from 'lucia';
import { eq } from 'drizzle-orm';
import { createDemoLucia } from '$lib/server/auth';
import { createDb, demoUsers, demoWidgets } from '$lib/server/db';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params, cookies, platform }) => {
	const { userId } = params;

	if (!platform?.env?.DATABASE_URL) {
		redirect(302, '/modules/widgets');
	}

	const db = createDb(platform.env.DATABASE_URL);

	// Get the user whose widgets we're creating for
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

	// Check permission
	const canEdit = currentUser?.id === userId || currentUser?.admin;
	if (!canEdit) {
		redirect(302, `/modules/widgets/users/${userId}/widgets`);
	}

	return {
		targetUser,
		currentUser
	};
};

export const actions: Actions = {
	default: async ({ request, params, cookies, platform }) => {
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
			const widgetId = generateIdFromEntropySize(10);
			await db.insert(demoWidgets).values({
				id: widgetId,
				userId,
				name: name.trim(),
				description: description?.trim() || null
			});
			redirect(302, `/modules/widgets/users/${userId}/widgets/${widgetId}`);
		} catch {
			return fail(500, { error: 'Failed to create widget', name, description });
		}
	}
};
