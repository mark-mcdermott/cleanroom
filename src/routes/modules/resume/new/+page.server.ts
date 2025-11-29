import { fail, redirect } from '@sveltejs/kit';
import { generateIdFromEntropySize } from 'lucia';
import { createDemoLucia } from '$lib/server/auth';
import { createDb, demoResumes } from '$lib/server/db';
import { generateLatex, createEmptyResumeData, type ResumeData } from '$lib/utils/resume/latex';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies, platform }) => {
	const sessionId = cookies.get('demo_auth_session');

	if (!sessionId || !platform?.env?.DATABASE_URL) {
		redirect(302, '/modules/resume/login');
	}

	const db = createDb(platform.env.DATABASE_URL);
	const lucia = createDemoLucia(db);
	const { user } = await lucia.validateSession(sessionId);

	if (!user) {
		redirect(302, '/modules/resume/login');
	}

	return { resumeData: createEmptyResumeData() };
};

export const actions: Actions = {
	default: async ({ request, cookies, platform }) => {
		const sessionId = cookies.get('demo_auth_session');

		if (!sessionId || !platform?.env?.DATABASE_URL) {
			return fail(401, { error: 'You must be logged in to create a resume' });
		}

		const db = createDb(platform.env.DATABASE_URL);
		const lucia = createDemoLucia(db);
		const { user } = await lucia.validateSession(sessionId);

		if (!user) {
			return fail(401, { error: 'You must be logged in to create a resume' });
		}

		const formData = await request.formData();
		const title = (formData.get('title') as string) || 'My Resume';
		const dataJson = formData.get('data') as string;

		if (!dataJson) {
			return fail(400, { error: 'Resume data is required' });
		}

		let resumeData: ResumeData;
		try {
			resumeData = JSON.parse(dataJson);
		} catch {
			return fail(400, { error: 'Invalid resume data format' });
		}

		const id = generateIdFromEntropySize(10);
		const latexSource = generateLatex(resumeData);

		try {
			await db.insert(demoResumes).values({
				id,
				userId: user.id,
				title,
				data: dataJson,
				latexSource
			});

			redirect(302, `/modules/resume/${id}`);
		} catch (e) {
			if (e instanceof Response) throw e;
			return fail(500, { error: 'Failed to create resume' });
		}
	}
};
