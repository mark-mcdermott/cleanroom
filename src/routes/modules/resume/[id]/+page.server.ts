import { error, fail, redirect } from '@sveltejs/kit';
import { createDemoLucia } from '$lib/server/auth';
import { createDb, demoResumes } from '$lib/server/db';
import { eq, and } from 'drizzle-orm';
import { generateLatex, parseResumeData, type ResumeData } from '$lib/utils/resume/latex';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, cookies, platform }) => {
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

	const [resume] = await db
		.select()
		.from(demoResumes)
		.where(and(eq(demoResumes.id, params.id), eq(demoResumes.userId, user.id)))
		.limit(1);

	if (!resume) {
		error(404, 'Resume not found');
	}

	const resumeData = parseResumeData(resume.data);

	return {
		resume,
		resumeData
	};
};

export const actions: Actions = {
	updateData: async ({ request, params, cookies, platform }) => {
		const sessionId = cookies.get('demo_auth_session');

		if (!sessionId || !platform?.env?.DATABASE_URL) {
			return fail(401, { error: 'You must be logged in' });
		}

		const db = createDb(platform.env.DATABASE_URL);
		const lucia = createDemoLucia(db);
		const { user } = await lucia.validateSession(sessionId);

		if (!user) {
			return fail(401, { error: 'You must be logged in' });
		}

		const formData = await request.formData();
		const title = formData.get('title') as string;
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

		const latexSource = generateLatex(resumeData);

		await db
			.update(demoResumes)
			.set({
				title: title || 'My Resume',
				data: dataJson,
				latexSource,
				latexCustomized: false,
				updatedAt: new Date()
			})
			.where(and(eq(demoResumes.id, params.id), eq(demoResumes.userId, user.id)));

		return { success: true };
	},

	updateLatex: async ({ request, params, cookies, platform }) => {
		const sessionId = cookies.get('demo_auth_session');

		if (!sessionId || !platform?.env?.DATABASE_URL) {
			return fail(401, { error: 'You must be logged in' });
		}

		const db = createDb(platform.env.DATABASE_URL);
		const lucia = createDemoLucia(db);
		const { user } = await lucia.validateSession(sessionId);

		if (!user) {
			return fail(401, { error: 'You must be logged in' });
		}

		const formData = await request.formData();
		const latexSource = formData.get('latex') as string;

		if (!latexSource) {
			return fail(400, { error: 'LaTeX source is required' });
		}

		await db
			.update(demoResumes)
			.set({
				latexSource,
				latexCustomized: true,
				updatedAt: new Date()
			})
			.where(and(eq(demoResumes.id, params.id), eq(demoResumes.userId, user.id)));

		return { success: true, latexUpdated: true };
	},

	regenerateLatex: async ({ params, cookies, platform }) => {
		const sessionId = cookies.get('demo_auth_session');

		if (!sessionId || !platform?.env?.DATABASE_URL) {
			return fail(401, { error: 'You must be logged in' });
		}

		const db = createDb(platform.env.DATABASE_URL);
		const lucia = createDemoLucia(db);
		const { user } = await lucia.validateSession(sessionId);

		if (!user) {
			return fail(401, { error: 'You must be logged in' });
		}

		const [resume] = await db
			.select()
			.from(demoResumes)
			.where(and(eq(demoResumes.id, params.id), eq(demoResumes.userId, user.id)))
			.limit(1);

		if (!resume) {
			return fail(404, { error: 'Resume not found' });
		}

		const resumeData = parseResumeData(resume.data);
		const latexSource = generateLatex(resumeData);

		await db
			.update(demoResumes)
			.set({
				latexSource,
				latexCustomized: false,
				updatedAt: new Date()
			})
			.where(and(eq(demoResumes.id, params.id), eq(demoResumes.userId, user.id)));

		return { success: true, regenerated: true };
	},

	delete: async ({ params, cookies, platform }) => {
		const sessionId = cookies.get('demo_auth_session');

		if (!sessionId || !platform?.env?.DATABASE_URL) {
			return fail(401, { error: 'You must be logged in' });
		}

		const db = createDb(platform.env.DATABASE_URL);
		const lucia = createDemoLucia(db);
		const { user } = await lucia.validateSession(sessionId);

		if (!user) {
			return fail(401, { error: 'You must be logged in' });
		}

		await db
			.delete(demoResumes)
			.where(and(eq(demoResumes.id, params.id), eq(demoResumes.userId, user.id)));

		redirect(302, '/modules/resume');
	}
};
