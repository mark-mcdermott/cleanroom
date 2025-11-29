import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { ProjectConfig, FeatureModule } from '../../types';

function getResumeSchema(): string {
	return `
// Resumes table
export const resumes = pgTable('resumes', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	title: text('title').notNull().default('My Resume'),
	data: text('data').notNull(), // JSON: { personal, experience[], education[], skills[] }
	latexSource: text('latex_source'),
	latexCustomized: boolean('latex_customized').notNull().default(false),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

export type Resume = typeof resumes.$inferSelect;
export type NewResume = typeof resumes.$inferInsert;
`;
}

function getResumeListPageServer(): string {
	return `import { createLucia } from '$lib/server/auth';
import { createDb, resumes } from '$lib/server/db';
import { desc, eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies, platform }) => {
	const sessionId = cookies.get('auth_session');
	const databaseUrl = platform?.env?.DATABASE_URL;

	if (!sessionId || !databaseUrl) {
		return { user: null, resumes: [] };
	}

	const db = createDb(databaseUrl);
	const lucia = createLucia(db);
	const { user } = await lucia.validateSession(sessionId);

	if (!user) {
		return { user: null, resumes: [] };
	}

	const userResumes = await db
		.select()
		.from(resumes)
		.where(eq(resumes.userId, user.id))
		.orderBy(desc(resumes.updatedAt));

	return { user, resumes: userResumes };
};
`;
}

function getResumeListPageSvelte(): string {
	return `<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button, Card } from '$lib/components/ui';
	import { FileText, Plus, Edit, Download } from 'lucide-svelte';

	let { data } = $props();

	function formatDate(date: Date | string) {
		return new Date(date).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>My Resumes - Resume Builder</title>
</svelte:head>

<div class="max-w-4xl mx-auto px-6 py-16">
	<div class="flex items-center justify-between mb-8">
		<div>
			<h1 class="text-3xl font-semibold tracking-tight flex items-center gap-3">
				<FileText class="w-8 h-8 text-blue-600" />
				My Resumes
			</h1>
			<p class="text-zinc-600 mt-2">Create and manage your professional resumes</p>
		</div>
		{#if data.user}
			<Button.Root onclick={() => goto('/resume/new')} class="cursor-pointer">
				<Plus class="w-4 h-4 mr-2" />
				New Resume
			</Button.Root>
		{/if}
	</div>

	{#if !data.user}
		<div class="bg-white border border-zinc-200 rounded-lg p-12 text-center">
			<FileText class="w-16 h-16 mx-auto text-zinc-300 mb-4" />
			<p class="text-zinc-600 mb-4">Please log in to create and manage your resumes</p>
			<Button.Root onclick={() => goto('/login')} class="cursor-pointer">
				Log In
			</Button.Root>
		</div>
	{:else if data.resumes.length === 0}
		<div class="bg-white border border-zinc-200 rounded-lg p-12 text-center">
			<FileText class="w-16 h-16 mx-auto text-zinc-300 mb-4" />
			<p class="text-zinc-600 mb-4">You haven't created any resumes yet</p>
			<Button.Root onclick={() => goto('/resume/new')} class="cursor-pointer">
				<Plus class="w-4 h-4 mr-2" />
				Create Your First Resume
			</Button.Root>
		</div>
	{:else}
		<div class="grid gap-4">
			{#each data.resumes as resume}
				<Card.Root class="hover:shadow-md transition-shadow">
					<Card.Content class="p-6">
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-4">
								<div class="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
									<FileText class="w-6 h-6 text-blue-600" />
								</div>
								<div>
									<h2 class="font-semibold text-lg">{resume.title}</h2>
									<p class="text-sm text-zinc-500">
										Last updated {formatDate(resume.updatedAt)}
									</p>
								</div>
							</div>
							<div class="flex items-center gap-2">
								<Button.Root
									variant="outline"
									size="sm"
									onclick={() => goto(\`/resume/\${resume.id}\`)}
									class="cursor-pointer"
								>
									<Edit class="w-4 h-4 mr-1" />
									Edit
								</Button.Root>
								<Button.Root
									variant="outline"
									size="sm"
									onclick={() => goto(\`/resume/\${resume.id}?export=pdf\`)}
									class="cursor-pointer"
								>
									<Download class="w-4 h-4 mr-1" />
									PDF
								</Button.Root>
							</div>
						</div>
					</Card.Content>
				</Card.Root>
			{/each}
		</div>
	{/if}
</div>
`;
}

export const resumeModule: FeatureModule = {
	name: 'resume',
	async apply(config: ProjectConfig, outputDir: string) {
		console.log('  → Adding resume builder module');

		// Create routes
		await mkdir(join(outputDir, 'src', 'routes', 'resume'), { recursive: true });

		// Write route files
		await writeFile(join(outputDir, 'src', 'routes', 'resume', '+page.svelte'), getResumeListPageSvelte());
		await writeFile(join(outputDir, 'src', 'routes', 'resume', '+page.server.ts'), getResumeListPageServer());

		// Update schema
		const schemaPath = join(outputDir, 'src', 'lib', 'server', 'db', 'schema.ts');
		try {
			let schema = await readFile(schemaPath, 'utf-8');
			if (!schema.includes('resumes')) {
				schema += '\n' + getResumeSchema();
				await writeFile(schemaPath, schema);
			}
		} catch {
			// Schema doesn't exist yet
		}

		// Update db index
		const dbIndexPath = join(outputDir, 'src', 'lib', 'server', 'db', 'index.ts');
		try {
			let dbIndex = await readFile(dbIndexPath, 'utf-8');
			if (!dbIndex.includes('resumes')) {
				dbIndex = dbIndex.replace(
					/export \{([^}]*)\} from '.\/schema'/,
					(match, exports) => `export {${exports}, resumes } from './schema'`
				);
				await writeFile(dbIndexPath, dbIndex);
			}
		} catch {
			// DB index doesn't exist yet
		}

		// Add dependencies
		const packageJsonPath = join(outputDir, 'package.json');
		try {
			const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf-8'));
			packageJson.dependencies = {
				...packageJson.dependencies,
				'lucide-svelte': '^0.468.0'
			};
			await writeFile(packageJsonPath, JSON.stringify(packageJson, null, '\t'));
		} catch {
			// Package.json doesn't exist
		}

		console.log('  → Resume module created successfully');
	}
};
