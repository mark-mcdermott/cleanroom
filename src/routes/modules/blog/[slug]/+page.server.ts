import { error } from '@sveltejs/kit';
import { createDb, demoPosts } from '$lib/server/db';
import { eq, and } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const prerender = false;

export const load: PageServerLoad = async ({ params, platform }) => {
	const databaseUrl = platform?.env?.DATABASE_URL;

	if (!databaseUrl) {
		error(500, 'Database not configured');
	}

	const db = createDb(databaseUrl);

	const [post] = await db
		.select()
		.from(demoPosts)
		.where(and(eq(demoPosts.slug, params.slug), eq(demoPosts.published, true)))
		.limit(1);

	if (!post) {
		error(404, 'Post not found');
	}

	return { post };
};
