import { fail, redirect } from '@sveltejs/kit';
import { generateIdFromEntropySize } from 'lucia';
import { asc, eq } from 'drizzle-orm';
import { createDemoLucia } from '$lib/server/auth';
import { createDb, demoUsers, demoSessions } from '$lib/server/db';
import { hashPassword } from '$lib/server/password';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ cookies, platform }) => {
	const sessionId = cookies.get('demo_auth_session');

	if (!sessionId || !platform?.env?.DATABASE_URL) {
		redirect(302, '/modules/auth/login');
	}

	const db = createDb(platform.env.DATABASE_URL);
	const lucia = createDemoLucia(db);
	const { user } = await lucia.validateSession(sessionId);

	if (!user) {
		redirect(302, '/modules/auth/login');
	}

	// Check if user is admin
	if (!user.admin) {
		redirect(302, '/modules/auth/private');
	}

	// Fetch all demo users
	const allUsers = await db
		.select({
			id: demoUsers.id,
			email: demoUsers.email,
			name: demoUsers.name,
			admin: demoUsers.admin,
			createdAt: demoUsers.createdAt
		})
		.from(demoUsers)
		.orderBy(asc(demoUsers.email));

	return {
		user: {
			email: user.email,
			name: user.name,
			admin: user.admin
		},
		users: allUsers
	};
};

export const actions: Actions = {
	delete: async ({ request, cookies, platform }) => {
		const sessionId = cookies.get('demo_auth_session');

		if (!sessionId || !platform?.env?.DATABASE_URL) {
			return fail(401, { error: 'Not authenticated' });
		}

		const db = createDb(platform.env.DATABASE_URL);
		const lucia = createDemoLucia(db);
		const { user } = await lucia.validateSession(sessionId);

		if (!user?.admin) {
			return fail(403, { error: 'Not authorized' });
		}

		const formData = await request.formData();
		const userId = formData.get('userId') as string;

		if (!userId) {
			return fail(400, { error: 'User ID is required' });
		}

		// Prevent deleting yourself
		if (userId === user.id) {
			return fail(400, { error: 'Cannot delete your own account' });
		}

		try {
			// Delete user's sessions first (foreign key constraint)
			await db.delete(demoSessions).where(eq(demoSessions.userId, userId));
			// Delete the user
			await db.delete(demoUsers).where(eq(demoUsers.id, userId));
			return { success: true };
		} catch {
			return fail(500, { error: 'Failed to delete user' });
		}
	},

	reset: async ({ cookies, platform }) => {
		const databaseUrl = platform?.env?.DATABASE_URL;
		if (!databaseUrl) {
			return fail(500, { error: 'Database not configured' });
		}

		const db = createDb(databaseUrl);
		const lucia = createDemoLucia(db);

		try {
			// Delete all demo sessions and users
			await db.delete(demoSessions);
			await db.delete(demoUsers);

			// All users get password "password123"
			const passwordHash = await hashPassword('password123');

			// Office-themed users
			const officeUsers = [
				{ id: generateIdFromEntropySize(10), email: 'michael@dundermifflin.com', name: 'Michael Scott', admin: true },
				{ id: generateIdFromEntropySize(10), email: 'dwight@dundermifflin.com', name: 'Dwight Schrute', admin: false },
				{ id: generateIdFromEntropySize(10), email: 'jim@dundermifflin.com', name: 'Jim Halpert', admin: false },
				{ id: generateIdFromEntropySize(10), email: 'pam@dundermifflin.com', name: 'Pam Beesly', admin: false },
				{ id: generateIdFromEntropySize(10), email: 'angela@dundermifflin.com', name: 'Angela Martin', admin: false },
				{ id: generateIdFromEntropySize(10), email: 'kevin@dundermifflin.com', name: 'Kevin Malone', admin: false },
				{ id: generateIdFromEntropySize(10), email: 'stanley@dundermifflin.com', name: 'Stanley Hudson', admin: false },
				{ id: generateIdFromEntropySize(10), email: 'andy@dundermifflin.com', name: 'Andy Bernard', admin: false },
				{ id: generateIdFromEntropySize(10), email: 'oscar@dundermifflin.com', name: 'Oscar Martinez', admin: false },
				{ id: generateIdFromEntropySize(10), email: 'phyllis@dundermifflin.com', name: 'Phyllis Vance', admin: false }
			];

			// Insert all users
			for (const user of officeUsers) {
				await db.insert(demoUsers).values({
					id: user.id,
					email: user.email,
					passwordHash,
					name: user.name,
					admin: user.admin
				});
			}

			// Create a session for Michael Scott (the admin) and log the user in
			const michaelId = officeUsers[0].id;
			const session = await lucia.createSession(michaelId, {});
			const sessionCookie = lucia.createSessionCookie(session.id);

			cookies.set(sessionCookie.name, sessionCookie.value, {
				path: '.',
				...sessionCookie.attributes
			});

			return { success: true, message: 'Demo reset! Logged in as Michael Scott (admin). Password for all users: password123' };
		} catch {
			return fail(500, { error: 'Failed to reset demo data' });
		}
	}
};
