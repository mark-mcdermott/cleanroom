import { redirect } from '@sveltejs/kit';
import { createLucia } from '$lib/server/auth';
import { createDb } from '$lib/server/db';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	redirect(302, '/');
};

export const actions: Actions = {
	default: async ({ locals, cookies, platform }) => {
		if (!locals.session) {
			redirect(302, '/');
		}

		const databaseUrl = platform?.env?.DATABASE_URL;
		if (!databaseUrl) {
			redirect(302, '/');
		}

		const db = createDb(databaseUrl);
		const lucia = createLucia(db);

		await lucia.invalidateSession(locals.session.id);

		const sessionCookie = lucia.createBlankSessionCookie();
		cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});

		redirect(302, '/');
	}
};
