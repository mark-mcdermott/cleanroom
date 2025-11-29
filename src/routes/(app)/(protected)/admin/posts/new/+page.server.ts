import { fail, redirect } from '@sveltejs/kit';
import { generateIdFromEntropySize } from 'lucia';
import { createDb, posts } from '$lib/server/db';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user?.admin) {
		redirect(302, '/');
	}
	return {};
};

export const actions: Actions = {
	default: async ({ request, locals, platform }) => {
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

		// Validate slug format
		if (!/^[a-z0-9-]+$/.test(slug)) {
			return fail(400, { error: 'Slug can only contain lowercase letters, numbers, and hyphens' });
		}

		const db = createDb(databaseUrl);

		try {
			const id = generateIdFromEntropySize(10);
			await db.insert(posts).values({
				id,
				title,
				slug,
				excerpt,
				content,
				coverImage,
				published,
				publishedAt: published ? new Date() : null,
				authorId: locals.user.id
			});

			redirect(302, '/admin/posts');
		} catch (e) {
			if ((e as { code?: string }).code === '23505') {
				return fail(400, { error: 'A post with this slug already exists' });
			}
			throw e;
		}
	}
};
