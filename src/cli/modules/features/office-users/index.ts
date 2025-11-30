import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { ProjectConfig, FeatureModule } from '../../types';

// Seed script for The Office characters
function getOfficeSeedScript(): string {
	return `import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { generateId } from 'lucia';
import { users } from './src/lib/server/db/schema';

if (!process.env.DATABASE_URL) {
	throw new Error('DATABASE_URL environment variable is required');
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

// The Office characters - all passwords are "dundermifflin"
// Hash generated with PBKDF2 (same as auth module uses)
const passwordHash = 'pbkdf2:100000:dGVzdHNhbHQxMjM0NQ==:8K+HkFqJzLxL5Kk5mL5nFQ==';

const officeCharacters = [
	{ name: 'Michael Scott', email: 'michael.scott@dundermifflin.com' },
	{ name: 'Dwight Schrute', email: 'dwight.schrute@dundermifflin.com' },
	{ name: 'Jim Halpert', email: 'jim.halpert@dundermifflin.com' },
	{ name: 'Pam Beesly', email: 'pam.beesly@dundermifflin.com' },
	{ name: 'Ryan Howard', email: 'ryan.howard@dundermifflin.com' },
	{ name: 'Andy Bernard', email: 'andy.bernard@dundermifflin.com' },
	{ name: 'Angela Martin', email: 'angela.martin@dundermifflin.com' },
	{ name: 'Kevin Malone', email: 'kevin.malone@dundermifflin.com' },
	{ name: 'Oscar Martinez', email: 'oscar.martinez@dundermifflin.com' },
	{ name: 'Stanley Hudson', email: 'stanley.hudson@dundermifflin.com' },
	{ name: 'Phyllis Vance', email: 'phyllis.vance@dundermifflin.com' },
	{ name: 'Meredith Palmer', email: 'meredith.palmer@dundermifflin.com' },
	{ name: 'Creed Bratton', email: 'creed.bratton@dundermifflin.com' },
	{ name: 'Kelly Kapoor', email: 'kelly.kapoor@dundermifflin.com' },
	{ name: 'Toby Flenderson', email: 'toby.flenderson@dundermifflin.com' },
	{ name: 'Darryl Philbin', email: 'darryl.philbin@dundermifflin.com' },
	{ name: 'Erin Hannon', email: 'erin.hannon@dundermifflin.com' },
	{ name: 'Gabe Lewis', email: 'gabe.lewis@dundermifflin.com' },
	{ name: 'Holly Flax', email: 'holly.flax@dundermifflin.com' },
	{ name: 'Jan Levinson', email: 'jan.levinson@dundermifflin.com' }
];

async function seed() {
	console.log('Seeding The Office characters...');
	console.log('Password for all users: dundermifflin');
	console.log('');

	for (const character of officeCharacters) {
		const id = generateId(15);
		await db.insert(users).values({
			id,
			email: character.email,
			passwordHash,
			name: character.name
		}).onConflictDoNothing();
		console.log(\`Created user: \${character.name} (\${character.email})\`);
	}

	console.log('');
	console.log('Done! You can now login as any character.');
	console.log('Example: michael.scott@dundermifflin.com / dundermifflin');
}

seed().catch(console.error);
`;
}

// Users listing page (optional - shows all seeded users)
function getUsersListingServer(): string {
	return `import { createDb, users } from '$lib/server/db';
import { asc } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ platform }) => {
	const databaseUrl = platform?.env?.DATABASE_URL;

	if (!databaseUrl) {
		return { users: [] };
	}

	const db = createDb(databaseUrl);

	const allUsers = await db
		.select({
			id: users.id,
			name: users.name,
			email: users.email,
			createdAt: users.createdAt
		})
		.from(users)
		.orderBy(asc(users.name));

	return { users: allUsers };
};
`;
}

function getUsersListingSvelte(config: ProjectConfig): string {
	return `<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Team - ${config.projectName}</title>
	<meta name="description" content="Meet the team at ${config.projectName}" />
</svelte:head>

<div class="max-w-4xl mx-auto px-6 py-16">
	<h1 class="text-4xl font-semibold tracking-tight mb-2">The Team</h1>
	<p class="text-muted-foreground mb-8">Meet the people of Dunder Mifflin Scranton</p>

	{#if data.users.length === 0}
		<p class="text-muted-foreground">No team members yet. Run <code class="bg-muted px-2 py-1 rounded">pnpm db:seed-office</code> to add The Office characters.</p>
	{:else}
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
			{#each data.users as user}
				<div class="border border-border rounded-lg p-4 hover:border-foreground/50 transition-colors">
					<div class="w-12 h-12 bg-muted rounded-full flex items-center justify-center text-xl mb-3">
						{user.name?.charAt(0) || '?'}
					</div>
					<h3 class="font-medium">{user.name || 'Unknown'}</h3>
					<p class="text-sm text-muted-foreground">{user.email}</p>
				</div>
			{/each}
		</div>
	{/if}
</div>
`;
}

export const officeUsersModule: FeatureModule = {
	name: 'office-users',
	async apply(config: ProjectConfig, outputDir: string) {
		// Create directories
		await mkdir(join(outputDir, 'scripts'), { recursive: true });
		await mkdir(join(outputDir, 'src', 'routes', 'team'), { recursive: true });

		// Write seed script
		await writeFile(join(outputDir, 'scripts', 'seed-office.ts'), getOfficeSeedScript());

		// Write team listing page
		await writeFile(join(outputDir, 'src', 'routes', 'team', '+page.server.ts'), getUsersListingServer());
		await writeFile(join(outputDir, 'src', 'routes', 'team', '+page.svelte'), getUsersListingSvelte(config));

		// Update package.json with seed script
		const packageJsonPath = join(outputDir, 'package.json');
		const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf-8'));

		packageJson.scripts = {
			...packageJson.scripts,
			'db:seed-office': 'npx tsx scripts/seed-office.ts'
		};

		await writeFile(packageJsonPath, JSON.stringify(packageJson, null, '\t'));
	}
};
