import { redirect } from '@sveltejs/kit';
import { createDemoLucia } from '$lib/server/auth';
import { createDb } from '$lib/server/db';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ cookies, platform }) => {
		const sessionId = cookies.get('demo_auth_session');

		if (sessionId && platform?.env?.DATABASE_URL) {
			const db = createDb(platform.env.DATABASE_URL);
			const lucia = createDemoLucia(db);
			await lucia.invalidateSession(sessionId);
		}

		cookies.delete('demo_auth_session', { path: '.' });

		redirect(302, '/modules/auth');
	}
};
