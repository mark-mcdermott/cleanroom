import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { createDb, demoUsers } from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, platform }) => {
	if (!platform?.env?.DATABASE_URL) {
		error(500, 'Database not configured');
	}

	const db = createDb(platform.env.DATABASE_URL);

	const [profileUser] = await db
		.select({
			id: demoUsers.id,
			email: demoUsers.email,
			name: demoUsers.name,
			createdAt: demoUsers.createdAt
		})
		.from(demoUsers)
		.where(eq(demoUsers.id, params.id))
		.limit(1);

	if (!profileUser) {
		error(404, 'User not found');
	}

	return { profileUser };
};
