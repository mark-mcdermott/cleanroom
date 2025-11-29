import { createDemoLucia } from '$lib/server/auth';
import { createDb, demoUsers } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies, platform, url }) => {
	const sessionId = cookies.get('demo_auth_session');

	if (!sessionId || !platform?.env?.DATABASE_URL) {
		return { user: null, isAdminView: false, demoUserId: null };
	}

	const db = createDb(platform.env.DATABASE_URL);
	const lucia = createDemoLucia(db);

	const { user } = await lucia.validateSession(sessionId);

	if (!user) {
		return { user: null, isAdminView: false, demoUserId: null };
	}

	// Check if we're in admin view mode (stored in URL search params or path)
	const isAdminView = url.pathname.includes('/admin') || url.searchParams.get('admin') === 'true';

	// Get the first demo user for demo landing page redirects
	const [firstUser] = await db
		.select({ id: demoUsers.id })
		.from(demoUsers)
		.limit(1);

	return {
		user: {
			id: user.id,
			email: user.email,
			name: user.name,
			admin: user.admin
		},
		isAdminView: user.admin && isAdminView,
		demoUserId: firstUser?.id || user.id
	};
};
