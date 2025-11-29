import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// GET /api/avatar/[userId] - Serve avatar image from R2
export const GET: RequestHandler = async ({ params, platform }) => {
	const { userId } = params;

	if (!platform?.env?.AVATARS) {
		error(500, 'R2 storage not configured');
	}

	// Try to get the avatar from R2
	const object = await platform.env.AVATARS.get(`avatars/${userId}`);

	if (!object) {
		// Return a default avatar or 404
		error(404, 'Avatar not found');
	}

	const headers = new Headers();
	headers.set('Content-Type', object.httpMetadata?.contentType || 'image/jpeg');
	headers.set('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
	headers.set('ETag', object.httpEtag);

	return new Response(object.body, { headers });
};
