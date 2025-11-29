import { error, fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { createDemoLucia } from '$lib/server/auth';
import { createDb, demoUsers } from '$lib/server/db';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params, cookies, platform }) => {
	const sessionId = cookies.get('demo_auth_session');

	if (!sessionId || !platform?.env?.DATABASE_URL) {
		redirect(302, '/modules/auth/login');
	}

	const db = createDb(platform.env.DATABASE_URL);
	const lucia = createDemoLucia(db);
	const { user: currentUser } = await lucia.validateSession(sessionId);

	if (!currentUser) {
		redirect(302, '/modules/auth/login');
	}

	if (!currentUser.admin) {
		redirect(302, '/modules/auth/private');
	}

	const [targetUser] = await db
		.select({
			id: demoUsers.id,
			email: demoUsers.email,
			name: demoUsers.name,
			admin: demoUsers.admin
		})
		.from(demoUsers)
		.where(eq(demoUsers.id, params.id))
		.limit(1);

	if (!targetUser) {
		error(404, 'User not found');
	}

	return {
		currentUser: {
			id: currentUser.id,
			admin: currentUser.admin
		},
		targetUser
	};
};

export const actions: Actions = {
	default: async ({ params, request, cookies, platform }) => {
		const sessionId = cookies.get('demo_auth_session');

		if (!sessionId || !platform?.env?.DATABASE_URL) {
			return fail(401, { error: 'Not authenticated' });
		}

		const db = createDb(platform.env.DATABASE_URL);
		const lucia = createDemoLucia(db);
		const { user } = await lucia.validateSession(sessionId);

		if (!user?.admin) {
			return fail(403, { error: 'Not authorized' });
		}

		const formData = await request.formData();
		const name = formData.get('name') as string;
		const email = formData.get('email') as string;
		const admin = formData.get('admin') === 'on';

		if (!email || !email.includes('@')) {
			return fail(400, { error: 'Valid email is required' });
		}

		// Prevent removing your own admin status
		if (params.id === user.id && !admin) {
			return fail(400, { error: 'Cannot remove your own admin status' });
		}

		try {
			await db
				.update(demoUsers)
				.set({
					name: name?.trim() || null,
					email: email.toLowerCase().trim(),
					admin,
					updatedAt: new Date()
				})
				.where(eq(demoUsers.id, params.id));

			redirect(302, `/modules/auth/admin/users/${params.id}?updated=true`);
		} catch (e) {
			if ((e as { code?: string }).code === '23505') {
				return fail(400, { error: 'Email already in use' });
			}
			return fail(500, { error: 'Failed to update user' });
		}
	}
};
