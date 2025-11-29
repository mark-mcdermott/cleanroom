import { error, fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { createDb, users, sessions } from '$lib/server/db';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params, locals, platform }) => {
	if (!locals.user?.admin) {
		redirect(302, '/');
	}

	const databaseUrl = platform?.env?.DATABASE_URL;
	if (!databaseUrl) {
		error(500, 'Database not configured');
	}

	const db = createDb(databaseUrl);

	const [targetUser] = await db
		.select({
			id: users.id,
			email: users.email,
			name: users.name,
			admin: users.admin,
			createdAt: users.createdAt,
			updatedAt: users.updatedAt
		})
		.from(users)
		.where(eq(users.id, params.id))
		.limit(1);

	if (!targetUser) {
		error(404, 'User not found');
	}

	return {
		currentUser: {
			id: locals.user.id,
			email: locals.user.email,
			name: locals.user.name,
			admin: locals.user.admin
		},
		targetUser
	};
};

export const actions: Actions = {
	delete: async ({ params, locals, platform }) => {
		if (!locals.user?.admin) {
			return fail(403, { error: 'Not authorized' });
		}

		if (params.id === locals.user.id) {
			return fail(400, { error: 'Cannot delete your own account' });
		}

		const databaseUrl = platform?.env?.DATABASE_URL;
		if (!databaseUrl) {
			return fail(500, { error: 'Database not configured' });
		}

		const db = createDb(databaseUrl);

		try {
			await db.delete(sessions).where(eq(sessions.userId, params.id));
			await db.delete(users).where(eq(users.id, params.id));
			redirect(302, '/admin/users?deleted=true');
		} catch {
			return fail(500, { error: 'Failed to delete user' });
		}
	}
};
