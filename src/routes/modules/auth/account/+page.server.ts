import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { createDemoLucia } from '$lib/server/auth';
import { createDb, demoUsers } from '$lib/server/db';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ cookies, platform }) => {
	const sessionId = cookies.get('demo_auth_session');

	if (!sessionId || !platform?.env?.DATABASE_URL) {
		redirect(302, '/modules/auth/login');
	}

	const db = createDb(platform.env.DATABASE_URL);
	const lucia = createDemoLucia(db);
	const { user } = await lucia.validateSession(sessionId);

	if (!user) {
		redirect(302, '/modules/auth/login');
	}

	return {
		user: {
			id: user.id,
			email: user.email,
			name: user.name
		}
	};
};

export const actions: Actions = {
	default: async ({ request, cookies, platform }) => {
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

		const formData = await request.formData();
		const name = formData.get('name') as string;
		const email = formData.get('email') as string;

		if (!email || !email.includes('@')) {
			return fail(400, { error: 'Valid email is required' });
		}

		try {
			await db
				.update(demoUsers)
				.set({
					name: name?.trim() || null,
					email: email.toLowerCase().trim(),
					updatedAt: new Date()
				})
				.where(eq(demoUsers.id, user.id));

			return { success: true };
		} catch (e) {
			if ((e as { code?: string }).code === '23505') {
				return fail(400, { error: 'Email already in use' });
			}
			return fail(500, { error: 'Failed to update profile' });
		}
	}
};
