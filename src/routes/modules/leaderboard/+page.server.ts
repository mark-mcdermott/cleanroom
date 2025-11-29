import { fail } from '@sveltejs/kit';
import { generateIdFromEntropySize } from 'lucia';
import { createDemoLucia } from '$lib/server/auth';
import { createDb, demoScores } from '$lib/server/db';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ cookies, platform }) => {
	const sessionId = cookies.get('demo_auth_session');

	if (!sessionId || !platform?.env?.DATABASE_URL) {
		return { isLoggedIn: false };
	}

	const db = createDb(platform.env.DATABASE_URL);
	const lucia = createDemoLucia(db);
	const { user } = await lucia.validateSession(sessionId);

	return { isLoggedIn: !!user };
};

export const actions: Actions = {
	submitScore: async ({ request, cookies, platform }) => {
		const sessionId = cookies.get('demo_auth_session');

		if (!sessionId || !platform?.env?.DATABASE_URL) {
			return fail(401, { error: 'You must be logged in to save scores' });
		}

		const db = createDb(platform.env.DATABASE_URL);
		const lucia = createDemoLucia(db);
		const { user } = await lucia.validateSession(sessionId);

		if (!user) {
			return fail(401, { error: 'You must be logged in to save scores' });
		}

		const formData = await request.formData();
		const scoreValue = formData.get('score') as string;

		if (!scoreValue) {
			return fail(400, { error: 'Score is required' });
		}

		const score = parseInt(scoreValue, 10);
		if (isNaN(score) || score < 0) {
			return fail(400, { error: 'Invalid score' });
		}

		try {
			await db.insert(demoScores).values({
				id: generateIdFromEntropySize(10),
				userId: user.id,
				score: String(score)
			});

			return { success: true, score };
		} catch {
			return fail(500, { error: 'Failed to save score' });
		}
	}
};
