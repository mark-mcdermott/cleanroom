import { error, fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { createDb, posts } from '$lib/server/db';
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

	const [post] = await db
		.select()
		.from(posts)
		.where(eq(posts.id, params.id))
		.limit(1);

	if (!post) {
		error(404, 'Post not found');
	}

	return { post };
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
		const title = (formData.get('title') as string)?.trim();
		const slug = (formData.get('slug') as string)?.trim().toLowerCase();
		const excerpt = (formData.get('excerpt') as string)?.trim() || null;
		const content = (formData.get('content') as string)?.trim();
		const coverImage = (formData.get('coverImage') as string)?.trim() || null;
		const published = formData.get('published') === 'on';

		if (!title) {
			return fail(400, { error: 'Title is required' });
		}
		if (!slug) {
			return fail(400, { error: 'Slug is required' });
		}
		if (!content) {
			return fail(400, { error: 'Content is required' });
		}

		if (!/^[a-z0-9-]+$/.test(slug)) {
			return fail(400, { error: 'Slug can only contain lowercase letters, numbers, and hyphens' });
		}

		const db = createDb(databaseUrl);

		// Get current post to check if publishing status changed
		const [currentPost] = await db
			.select({ published: posts.published })
			.from(posts)
			.where(eq(posts.id, params.id))
			.limit(1);

		try {
			const updateData: Record<string, unknown> = {
				title,
				slug,
				excerpt,
				content,
				coverImage,
				published,
				updatedAt: new Date()
			};

			// Set publishedAt when first publishing
			if (published && !currentPost?.published) {
				updateData.publishedAt = new Date();
			}

			await db
				.update(posts)
				.set(updateData)
				.where(eq(posts.id, params.id));

			redirect(302, '/admin/posts');
		} catch (e) {
			if ((e as { code?: string }).code === '23505') {
				return fail(400, { error: 'A post with this slug already exists' });
			}
			throw e;
		}
	}
};
