import { fail } from '@sveltejs/kit';
import { desc, eq } from 'drizzle-orm';
import { createDb, demoPosts } from '$lib/server/db';
import type { PageServerLoad, Actions } from './$types';

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
			published: demoPosts.published,
			publishedAt: demoPosts.publishedAt,
			createdAt: demoPosts.createdAt,
			updatedAt: demoPosts.updatedAt
		})
		.from(demoPosts)
		.orderBy(desc(demoPosts.createdAt));

	return { posts: allPosts };
};

export const actions: Actions = {
	delete: async ({ request, platform }) => {
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
			await db.delete(demoPosts).where(eq(demoPosts.id, postId));
			return { success: true };
		} catch {
			return fail(500, { error: 'Failed to delete post' });
		}
	},

	reset: async ({ platform }) => {
		const databaseUrl = platform?.env?.DATABASE_URL;
		if (!databaseUrl) {
			return fail(500, { error: 'Database not configured' });
		}

		const db = createDb(databaseUrl);

		try {
			// Delete all demo posts
			await db.delete(demoPosts);

			// Insert sample demo posts
			const samplePosts = [
				{
					id: 'demo-post-1',
					slug: 'getting-started-with-sveltekit',
					title: 'Getting Started with SvelteKit',
					excerpt: 'Learn how to build modern web applications with SvelteKit, the official framework for building Svelte apps.',
					content: `<p>SvelteKit is a framework for building web applications of all sizes, with a beautiful development experience and flexible filesystem-based routing.</p>
<h2>Why SvelteKit?</h2>
<p>Unlike traditional frameworks, SvelteKit compiles your code to tiny, framework-less vanilla JavaScript. Your app starts fast and stays fast.</p>
<h3>Key Features</h3>
<ul>
<li>File-based routing</li>
<li>Server-side rendering</li>
<li>Code splitting</li>
<li>Hot module replacement</li>
</ul>
<p>Ready to get started? Check out the official <a href="https://kit.svelte.dev">SvelteKit documentation</a>.</p>`,
					coverImage: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=400&fit=crop',
					published: true,
					publishedAt: new Date(Date.now() - 86400000 * 2)
				},
				{
					id: 'demo-post-2',
					slug: 'mastering-tailwind-css',
					title: 'Mastering Tailwind CSS',
					excerpt: 'Discover how utility-first CSS can speed up your development workflow and create consistent designs.',
					content: `<p>Tailwind CSS is a utility-first CSS framework that provides low-level utility classes to build custom designs.</p>
<h2>The Utility-First Approach</h2>
<p>Instead of pre-designed components, Tailwind provides utility classes that you compose to build any design directly in your markup.</p>
<blockquote>The best way to learn Tailwind is to just start using it.</blockquote>
<p>With Tailwind, you can rapidly build modern websites without ever leaving your HTML.</p>`,
					coverImage: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&h=400&fit=crop',
					published: true,
					publishedAt: new Date(Date.now() - 86400000)
				},
				{
					id: 'demo-post-3',
					slug: 'draft-post-example',
					title: 'Draft Post Example',
					excerpt: 'This is a draft post that is not published yet.',
					content: '<p>This post is still being written and has not been published yet.</p>',
					coverImage: null,
					published: false,
					publishedAt: null
				}
			];

			for (const post of samplePosts) {
				await db.insert(demoPosts).values(post);
			}

			return { success: true, message: 'Demo data reset successfully' };
		} catch {
			return fail(500, { error: 'Failed to reset demo data' });
		}
	}
};
