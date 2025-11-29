import { fail, redirect } from '@sveltejs/kit';
import { asc, eq } from 'drizzle-orm';
import { createDb, users, sessions } from '$lib/server/db';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals, platform }) => {
	// Already protected by (protected) layout, but check admin
	if (!locals.user?.admin) {
		redirect(302, '/');
	}

	const databaseUrl = platform?.env?.DATABASE_URL;
	if (!databaseUrl) {
		return { users: [] };
	}

	const db = createDb(databaseUrl);

	const allUsers = await db
		.select({
			id: users.id,
			email: users.email,
			name: users.name,
			admin: users.admin,
			createdAt: users.createdAt
		})
		.from(users)
		.orderBy(asc(users.email));

	return { users: allUsers };
};

export const actions: Actions = {
	delete: async ({ request, locals, platform }) => {
		if (!locals.user?.admin) {
			return fail(403, { error: 'Not authorized' });
		}

		const databaseUrl = platform?.env?.DATABASE_URL;
		if (!databaseUrl) {
			return fail(500, { error: 'Database not configured' });
		}

		const formData = await request.formData();
		const userId = formData.get('userId') as string;

		if (!userId) {
			return fail(400, { error: 'User ID is required' });
		}

		// Prevent deleting yourself
		if (userId === locals.user.id) {
			return fail(400, { error: 'Cannot delete your own account' });
		}

		const db = createDb(databaseUrl);

		try {
			await db.delete(sessions).where(eq(sessions.userId, userId));
			await db.delete(users).where(eq(users.id, userId));
			return { success: true };
		} catch {
			return fail(500, { error: 'Failed to delete user' });
		}
	}
};
