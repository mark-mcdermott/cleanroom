import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// GET /api/widgets/photos/[photoId] - Serve widget photo from R2
export const GET: RequestHandler = async ({ params, platform }) => {
	const { photoId } = params;

	if (!platform?.env?.WIDGET_PHOTOS) {
		error(500, 'R2 storage not configured');
	}

	// Try to get the photo from R2
	const object = await platform.env.WIDGET_PHOTOS.get(`photos/${photoId}`);

	if (!object) {
		error(404, 'Photo not found');
	}

	const headers = new Headers();
	headers.set('Content-Type', object.httpMetadata?.contentType || 'image/jpeg');
	headers.set('Cache-Control', 'public, max-age=31536000');
	headers.set('ETag', object.httpEtag);

	return new Response(object.body, { headers });
};
