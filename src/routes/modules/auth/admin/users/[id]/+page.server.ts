import { error, fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { createDemoLucia } from '$lib/server/auth';
import { createDb, demoUsers, demoSessions } from '$lib/server/db';
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
			admin: demoUsers.admin,
			createdAt: demoUsers.createdAt,
			updatedAt: demoUsers.updatedAt
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
			email: currentUser.email,
			name: currentUser.name,
			admin: currentUser.admin
		},
		targetUser
	};
};

export const actions: Actions = {
	delete: async ({ params, cookies, platform }) => {
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

		// Prevent deleting yourself
		if (params.id === user.id) {
			return fail(400, { error: 'Cannot delete your own account' });
		}

		try {
			await db.delete(demoSessions).where(eq(demoSessions.userId, params.id));
			await db.delete(demoUsers).where(eq(demoUsers.id, params.id));
			redirect(302, '/modules/auth/admin/users?deleted=true');
		} catch {
			return fail(500, { error: 'Failed to delete user' });
		}
	}
};
