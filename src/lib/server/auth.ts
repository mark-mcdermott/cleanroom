import { Lucia } from 'lucia';
import { DrizzlePostgreSQLAdapter } from '@lucia-auth/adapter-drizzle';
import { dev } from '$app/environment';
import { sessions, users, demoSessions, demoUsers, type Database } from '$lib/server/db';

export function createLucia(db: Database) {
	const adapter = new DrizzlePostgreSQLAdapter(db, sessions, users);

	return new Lucia(adapter, {
		sessionCookie: {
			attributes: {
				secure: !dev
			}
		},
		getUserAttributes: (attributes) => ({
			email: attributes.email,
			name: attributes.name,
			admin: attributes.admin,
			avatarUrl: attributes.avatarUrl
		})
	});
}

export function createDemoLucia(db: Database) {
	const adapter = new DrizzlePostgreSQLAdapter(db, demoSessions, demoUsers);

	return new Lucia(adapter, {
		sessionCookie: {
			name: 'demo_auth_session',
			attributes: {
				secure: !dev
			}
		},
		getUserAttributes: (attributes) => ({
			email: attributes.email,
			name: attributes.name,
			admin: attributes.admin,
			avatarUrl: attributes.avatarUrl
		})
	});
}

declare module 'lucia' {
	interface Register {
		Lucia: ReturnType<typeof createLucia>;
		DatabaseUserAttributes: DatabaseUserAttributes;
	}
}

interface DatabaseUserAttributes {
	email: string;
	name: string | null;
	admin: boolean;
	avatarUrl: string | null;
}
