import { fail, redirect } from '@sveltejs/kit';
import { generateIdFromEntropySize } from 'lucia';
import { asc, eq, count } from 'drizzle-orm';
import { createDemoLucia } from '$lib/server/auth';
import { createDb, demoUsers, demoWidgets, demoThingys, demoNotes, demoPhotos, demoGalleries, demoSessions } from '$lib/server/db';
import { hashPassword } from '$lib/server/password';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ cookies, platform }) => {
	const sessionId = cookies.get('demo_auth_session');

	if (!sessionId || !platform?.env?.DATABASE_URL) redirect(302, '/modules/auth/login');

	const db = createDb(platform.env.DATABASE_URL);
	const lucia = createDemoLucia(db);
	const { user } = await lucia.validateSession(sessionId);

	if (!user?.admin) redirect(302, '/modules/widgets');

	// Get all users with widget counts
	const users = await db
		.select({
			id: demoUsers.id,
			name: demoUsers.name,
			email: demoUsers.email,
			admin: demoUsers.admin,
			createdAt: demoUsers.createdAt
		})
		.from(demoUsers)
		.orderBy(asc(demoUsers.email));

	// Get widget counts per user
	const usersWithCounts = await Promise.all(users.map(async (u) => {
		const [{ widgetCount }] = await db.select({ widgetCount: count() }).from(demoWidgets).where(eq(demoWidgets.userId, u.id));
		return { ...u, widgetCount };
	}));

	// Get totals
	const [{ totalWidgets }] = await db.select({ totalWidgets: count() }).from(demoWidgets);
	const [{ totalThingys }] = await db.select({ totalThingys: count() }).from(demoThingys);
	const [{ totalNotes }] = await db.select({ totalNotes: count() }).from(demoNotes);
	const [{ totalPhotos }] = await db.select({ totalPhotos: count() }).from(demoPhotos);
	const [{ totalGalleries }] = await db.select({ totalGalleries: count() }).from(demoGalleries);

	return {
		currentUser: { id: user.id, name: user.name, email: user.email, admin: user.admin },
		users: usersWithCounts,
		stats: { totalWidgets, totalThingys, totalNotes, totalPhotos, totalGalleries }
	};
};

export const actions: Actions = {
	reset: async ({ cookies, platform }) => {
		if (!platform?.env?.DATABASE_URL) return fail(500, { error: 'Database not configured' });

		const db = createDb(platform.env.DATABASE_URL);
		const lucia = createDemoLucia(db);

		try {
			// Delete all widget-related data
			await db.delete(demoPhotos);
			await db.delete(demoNotes);
			await db.delete(demoGalleries);
			await db.delete(demoThingys);
			await db.delete(demoWidgets);
			await db.delete(demoSessions);
			await db.delete(demoUsers);

			const passwordHash = await hashPassword('password123');

			// Recreate Office users with some widgets
			const officeUsers = [
				{ id: generateIdFromEntropySize(10), email: 'michael@dundermifflin.com', name: 'Michael Scott', admin: true },
				{ id: generateIdFromEntropySize(10), email: 'dwight@dundermifflin.com', name: 'Dwight Schrute', admin: false },
				{ id: generateIdFromEntropySize(10), email: 'jim@dundermifflin.com', name: 'Jim Halpert', admin: false },
				{ id: generateIdFromEntropySize(10), email: 'pam@dundermifflin.com', name: 'Pam Beesly', admin: false }
			];

			for (const user of officeUsers) {
				await db.insert(demoUsers).values({ ...user, passwordHash });
			}

			// Create sample widgets for Michael
			const sampleWidgets = [
				{ name: "World's Best Boss Mug", description: 'My prized possession.' },
				{ name: 'Dundie Awards', description: 'Collection of prestigious Dundie awards.' },
				{ name: 'Prison Mike Costume', description: 'For when I need to scare people straight.' }
			];

			for (const widget of sampleWidgets) {
				const widgetId = generateIdFromEntropySize(10);
				await db.insert(demoWidgets).values({
					id: widgetId,
					userId: officeUsers[0].id,
					name: widget.name,
					description: widget.description
				});

				// Add a thingy to each widget
				await db.insert(demoThingys).values({
					id: generateIdFromEntropySize(10),
					widgetId,
					name: 'Sample Thingy',
					description: 'A sample thingy for this widget.',
					sortOrder: '0'
				});

				// Add a note
				await db.insert(demoNotes).values({
					id: generateIdFromEntropySize(10),
					widgetId,
					content: 'This is a sample note for this widget.',
					sortOrder: '0'
				});
			}

			// Create session for Michael
			const session = await lucia.createSession(officeUsers[0].id, {});
			const sessionCookie = lucia.createSessionCookie(session.id);

			cookies.set(sessionCookie.name, sessionCookie.value, {
				path: '.',
				...sessionCookie.attributes
			});

			return { success: true };
		} catch {
			return fail(500, { error: 'Failed to reset demo' });
		}
	}
};
