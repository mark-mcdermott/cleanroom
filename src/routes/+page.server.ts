import { db, users } from '$lib/server/db';
import { count } from 'drizzle-orm';

export async function load() {
	const database = db();
	const [result] = await database.select({ count: count() }).from(users);
	const userCount = result?.count ?? 0;

	return {
		userCount,
		dbConnected: true
	};
}
