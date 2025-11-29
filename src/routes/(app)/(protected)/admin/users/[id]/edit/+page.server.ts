import { error, fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { createDb, users } from '$lib/server/db';
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
			admin: users.admin
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
			admin: locals.user.admin
		},
		targetUser
	};
};

export const actions: Actions = {
	default: async ({ params, request, locals, platform }) => {
		if (!locals.user?.admin) {
			return fail(403, { error: 'Not authorized' });
		}

		const databaseUrl = platform?.env?.DATABASE_URL;
		if (!databaseUrl) {
			return fail(500, { error: 'Database not configured' });
		}

		const formData = await request.formData();
		const name = formData.get('name') as string;
		const email = formData.get('email') as string;
		const admin = formData.get('admin') === 'on';

		if (!email || !email.includes('@')) {
			return fail(400, { error: 'Valid email is required' });
		}

		// Prevent removing your own admin status
		if (params.id === locals.user.id && !admin) {
			return fail(400, { error: 'Cannot remove your own admin status' });
		}

		const db = createDb(databaseUrl);

		try {
			await db
				.update(users)
				.set({
					name: name?.trim() || null,
					email: email.toLowerCase().trim(),
					admin,
					updatedAt: new Date()
				})
				.where(eq(users.id, params.id));

			redirect(302, `/admin/users/${params.id}?updated=true`);
		} catch (e) {
			if ((e as { code?: string }).code === '23505') {
				return fail(400, { error: 'Email already in use' });
			}
			return fail(500, { error: 'Failed to update user' });
		}
	}
};
