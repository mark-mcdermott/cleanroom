import { redirect } from '@sveltejs/kit';
import { createDemoLucia } from '$lib/server/auth';
import { createDb, demoUsers } from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies, platform }) => {
	const sessionId = cookies.get('demo_auth_session');

	if (!platform?.env?.DATABASE_URL) {
		return { needsLogin: true };
	}

	const db = createDb(platform.env.DATABASE_URL);

	// Get the first demo user for landing redirect
	const [firstUser] = await db
		.select({ id: demoUsers.id })
		.from(demoUsers)
		.limit(1);

	if (!firstUser) {
		return { needsSetup: true };
	}

	// Check if logged in
	if (sessionId) {
		const lucia = createDemoLucia(db);
		const { user } = await lucia.validateSession(sessionId);

		if (user) {
			// Redirect to the logged-in user's widgets
			redirect(302, `/modules/widgets/users/${user.id}/widgets`);
		}
	}

	// Not logged in - redirect to demo user's widgets
	redirect(302, `/modules/widgets/users/${firstUser.id}/widgets`);
};
