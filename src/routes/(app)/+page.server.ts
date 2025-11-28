import { createDb, users } from '$lib/server/db';
import { count } from 'drizzle-orm';

export async function load({ platform }) {
	const databaseUrl = platform?.env?.DATABASE_URL;
	if (!databaseUrl) {
		return {
			userCount: 0,
			dbConnected: false,
			error: 'DATABASE_URL not configured'
		};
	}

	const db = createDb(databaseUrl);
	const [result] = await db.select({ count: count() }).from(users);
	const userCount = result?.count ?? 0;

	return {
		userCount,
		dbConnected: true
	};
}
