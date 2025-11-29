import { createDemoLucia } from '$lib/server/auth';
import { createDb } from '$lib/server/db';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies, platform }) => {
	const sessionId = cookies.get('demo_auth_session');

	if (!sessionId || !platform?.env?.DATABASE_URL) {
		return { user: null };
	}

	const db = createDb(platform.env.DATABASE_URL);
	const lucia = createDemoLucia(db);

	const { user } = await lucia.validateSession(sessionId);

	if (!user) {
		return { user: null };
	}

	return {
		user: {
			id: user.id,
			email: user.email,
			name: user.name,
			admin: user.admin
		}
	};
};
