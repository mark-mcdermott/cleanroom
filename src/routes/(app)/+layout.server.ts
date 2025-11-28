import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, platform }) => {
	const databaseUrl = platform?.env?.DATABASE_URL;

	return {
		user: locals.user,
		dbConnected: !!databaseUrl
	};
};
