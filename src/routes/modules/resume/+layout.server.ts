import { redirect } from '@sveltejs/kit';
import { createDemoLucia } from '$lib/server/auth';
import { createDb } from '$lib/server/db';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies, platform, url }) => {
	const sessionId = cookies.get('demo_auth_session');
	const publicPaths = ['/modules/resume/login', '/modules/resume/signup'];

	if (!sessionId || !platform?.env?.DATABASE_URL) {
		if (!publicPaths.includes(url.pathname)) {
			throw redirect(302, '/modules/resume/login');
		}
		return { user: null };
	}

	const db = createDb(platform.env.DATABASE_URL);
	const lucia = createDemoLucia(db);
	const { user } = await lucia.validateSession(sessionId);

	if (!user && !publicPaths.includes(url.pathname)) {
		throw redirect(302, '/modules/resume/login');
	}

	return { user };
};
