import { createDb, demoScores, demoUsers } from '$lib/server/db';
import { desc, eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ platform }) => {
	if (!platform?.env?.DATABASE_URL) {
		return { scores: [] };
	}

	const db = createDb(platform.env.DATABASE_URL);

	// Get top 50 scores with user info, ordered by score descending
	const scores = await db
		.select({
			id: demoScores.id,
			score: demoScores.score,
			createdAt: demoScores.createdAt,
			userName: demoUsers.name,
			userEmail: demoUsers.email
		})
		.from(demoScores)
		.leftJoin(demoUsers, eq(demoScores.userId, demoUsers.id))
		.orderBy(desc(demoScores.score))
		.limit(50);

	return { scores };
};
