import { fail, redirect } from '@sveltejs/kit';
import { createDb, demoTrackerCategories } from '$lib/server/db';
import type { PageServerLoad, Actions } from './$types';

export const prerender = false;

export const load: PageServerLoad = async () => {
	return {};
};

export const actions: Actions = {
	default: async ({ request, platform }) => {
		const databaseUrl = platform?.env?.DATABASE_URL;
		if (!databaseUrl) {
			return fail(500, { error: 'Database not configured' });
		}

		const formData = await request.formData();
		const name = formData.get('name') as string;
		const icon = formData.get('icon') as string;
		const color = formData.get('color') as string;
		const description = formData.get('description') as string;

		if (!name) {
			return fail(400, { error: 'Name is required' });
		}

		const db = createDb(databaseUrl);

		try {
			const slug = name
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, '-')
				.replace(/^-|-$/g, '');

			const id = `cat-${crypto.randomUUID().slice(0, 8)}`;

			await db.insert(demoTrackerCategories).values({
				id,
				name,
				slug,
				icon: icon || '📊',
				color: color || '#3b82f6',
				description: description || null,
				sortOrder: '99'
			});

			throw redirect(303, '/modules/tracker/admin');
		} catch (e) {
			if (e instanceof Response) throw e;
			console.error('Failed to create category:', e);
			return fail(500, { error: 'Failed to create category' });
		}
	}
};
