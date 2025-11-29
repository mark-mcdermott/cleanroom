import { createDb, demoResumes } from '$lib/server/db';
import { eq, desc } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ platform, parent }) => {
	const { user } = await parent();

	if (!user || !platform?.env?.DATABASE_URL) {
		return { resumes: [] };
	}

	const db = createDb(platform.env.DATABASE_URL);

	const resumes = await db
		.select()
		.from(demoResumes)
		.where(eq(demoResumes.userId, user.id))
		.orderBy(desc(demoResumes.updatedAt));

	return { resumes };
};
