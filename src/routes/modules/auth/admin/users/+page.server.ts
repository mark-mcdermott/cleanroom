import { fail, redirect } from '@sveltejs/kit';
import { asc, eq } from 'drizzle-orm';
import { createDemoLucia } from '$lib/server/auth';
import { createDb, demoUsers, demoSessions } from '$lib/server/db';
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

	// Check if user is admin
	if (!user.admin) {
		redirect(302, '/modules/auth/private');
	}

	// Fetch all demo users
	const allUsers = await db
		.select({
			id: demoUsers.id,
			email: demoUsers.email,
			name: demoUsers.name,
			admin: demoUsers.admin,
			createdAt: demoUsers.createdAt
		})
		.from(demoUsers)
		.orderBy(asc(demoUsers.email));

	return {
		user: {
			email: user.email,
			name: user.name,
			admin: user.admin
		},
		users: allUsers
	};
};

export const actions: Actions = {
	delete: async ({ request, cookies, platform }) => {
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
		const userId = formData.get('userId') as string;

		if (!userId) {
			return fail(400, { error: 'User ID is required' });
		}

		// Prevent deleting yourself
		if (userId === user.id) {
			return fail(400, { error: 'Cannot delete your own account' });
		}

		try {
			// Delete user's sessions first (foreign key constraint)
			await db.delete(demoSessions).where(eq(demoSessions.userId, userId));
			// Delete the user
			await db.delete(demoUsers).where(eq(demoUsers.id, userId));
			return { success: true };
		} catch {
			return fail(500, { error: 'Failed to delete user' });
		}
	}
};
