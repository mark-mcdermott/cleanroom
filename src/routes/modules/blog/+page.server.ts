import { createDb, demoPosts } from '$lib/server/db';
import { desc, eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const prerender = false;

export const load: PageServerLoad = async ({ platform }) => {
	const databaseUrl = platform?.env?.DATABASE_URL;

	if (!databaseUrl) {
		return { posts: [] };
	}

	const db = createDb(databaseUrl);

	const allPosts = await db
		.select({
			id: demoPosts.id,
			slug: demoPosts.slug,
			title: demoPosts.title,
			excerpt: demoPosts.excerpt,
			coverImage: demoPosts.coverImage,
			publishedAt: demoPosts.publishedAt,
			createdAt: demoPosts.createdAt
		})
		.from(demoPosts)
		.where(eq(demoPosts.published, true))
		.orderBy(desc(demoPosts.publishedAt));

	return { posts: allPosts };
};
