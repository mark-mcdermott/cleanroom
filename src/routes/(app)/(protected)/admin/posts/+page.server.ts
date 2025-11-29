import { fail, redirect } from '@sveltejs/kit';
import { desc, eq } from 'drizzle-orm';
import { createDb, posts } from '$lib/server/db';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals, platform }) => {
	if (!locals.user?.admin) {
		redirect(302, '/');
	}

	const databaseUrl = platform?.env?.DATABASE_URL;
	if (!databaseUrl) {
		return { posts: [] };
	}

	const db = createDb(databaseUrl);

	const allPosts = await db
		.select({
			id: posts.id,
			slug: posts.slug,
			title: posts.title,
			published: posts.published,
			publishedAt: posts.publishedAt,
			createdAt: posts.createdAt,
			updatedAt: posts.updatedAt
		})
		.from(posts)
		.orderBy(desc(posts.createdAt));

	return { posts: allPosts };
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
		const postId = formData.get('postId') as string;

		if (!postId) {
			return fail(400, { error: 'Post ID is required' });
		}

		const db = createDb(databaseUrl);

		try {
			await db.delete(posts).where(eq(posts.id, postId));
			return { success: true };
		} catch {
			return fail(500, { error: 'Failed to delete post' });
		}
	}
};
