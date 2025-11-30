import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { ProjectConfig, FeatureModule } from '../../types';

// Schema for leaderboard scores table
function getLeaderboardSchema(): string {
	return `
// Leaderboard scores table
export const scores = pgTable('scores', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	score: text('score').notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

export type Score = typeof scores.$inferSelect;
export type NewScore = typeof scores.$inferInsert;
`;
}

// Game page component
function getGamePageSvelte(): string {
	return `<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui';
	import { Trophy, Play, RotateCcw } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	let { data } = $props();

	let gameState = $state<'idle' | 'playing' | 'ended'>('idle');
	let score = $state(0);
	let timeLeft = $state(10);
	let clickCount = $state(0);
	let gameInterval = $state<ReturnType<typeof setInterval> | null>(null);

	function startGame() {
		gameState = 'playing';
		score = 0;
		clickCount = 0;
		timeLeft = 10;

		gameInterval = setInterval(() => {
			timeLeft--;
			if (timeLeft <= 0) {
				endGame();
			}
		}, 1000);
	}

	function handleClick() {
		if (gameState === 'playing') {
			clickCount++;
			score = clickCount * 10;
		}
	}

	function endGame() {
		gameState = 'ended';
		if (gameInterval) {
			clearInterval(gameInterval);
			gameInterval = null;
		}
	}

	function resetGame() {
		gameState = 'idle';
		score = 0;
		clickCount = 0;
		timeLeft = 10;
	}
</script>

<svelte:head>
	<title>Click Game - Leaderboard</title>
</svelte:head>

<div class="max-w-2xl mx-auto px-6 py-16">
	<div class="text-center mb-8">
		<h1 class="text-3xl font-semibold tracking-tight">Click Game</h1>
		<p class="text-muted-foreground mt-2">Click as fast as you can in 10 seconds!</p>
		{#if !data.user}
			<p class="text-amber-600 mt-2 text-sm">Log in to save your scores</p>
		{/if}
	</div>

	<div class="bg-background border-2 border-border rounded-xl p-8 mb-8">
		<div class="flex justify-between items-center mb-6">
			<div class="text-center">
				<p class="text-sm text-muted-foreground">Score</p>
				<p class="text-3xl font-bold text-blue-600">{score}</p>
			</div>
			<div class="text-center">
				<p class="text-sm text-muted-foreground">Time Left</p>
				<p class="text-3xl font-bold {timeLeft <= 3 ? 'text-red-600' : 'text-foreground'}">{timeLeft}s</p>
			</div>
			<div class="text-center">
				<p class="text-sm text-muted-foreground">Clicks</p>
				<p class="text-3xl font-bold text-green-600">{clickCount}</p>
			</div>
		</div>

		<div
			class="w-full h-64 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-100 select-none
				{gameState === 'idle' ? 'bg-muted hover:bg-accent' : ''}
				{gameState === 'playing' ? 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700 active:scale-95' : ''}
				{gameState === 'ended' ? 'bg-green-100' : ''}"
			onclick={handleClick}
			onkeydown={(e) => e.key === ' ' && handleClick()}
			role="button"
			tabindex="0"
		>
			{#if gameState === 'idle'}
				<div class="text-center">
					<Play class="w-16 h-16 mx-auto text-muted-foreground mb-4" />
					<p class="text-muted-foreground font-medium">Click Start to Play</p>
				</div>
			{:else if gameState === 'playing'}
				<div class="text-center text-white">
					<p class="text-6xl font-bold">{clickCount}</p>
					<p class="text-xl mt-2">CLICK!</p>
				</div>
			{:else}
				<div class="text-center">
					<Trophy class="w-16 h-16 mx-auto text-green-600 mb-4" />
					<p class="text-2xl font-bold text-green-800">Game Over!</p>
					<p class="text-4xl font-bold text-green-600 mt-2">{score} points</p>
				</div>
			{/if}
		</div>

		<div class="mt-6 flex justify-center gap-4">
			{#if gameState === 'idle'}
				<Button.Root onclick={startGame} size="lg" class="cursor-pointer">
					<Play class="w-5 h-5 mr-2" />
					Start Game
				</Button.Root>
			{:else if gameState === 'ended'}
				<Button.Root onclick={resetGame} variant="outline" class="cursor-pointer">
					<RotateCcw class="w-4 h-4 mr-2" />
					Play Again
				</Button.Root>
				{#if data.user}
					<form
						method="POST"
						action="?/submitScore"
						use:enhance={() => {
							return async ({ result }) => {
								if (result.type === 'success') {
									toast.success(\`Score of \${score} saved!\`);
								}
							};
						}}
					>
						<input type="hidden" name="score" value={score} />
						<Button.Root type="submit" class="cursor-pointer">
							<Trophy class="w-4 h-4 mr-2" />
							Save Score
						</Button.Root>
					</form>
				{/if}
			{/if}
		</div>
	</div>

	<div class="text-center">
		<a href="/leaderboard/scores" class="text-blue-600 hover:underline flex items-center justify-center gap-2">
			<Trophy class="w-4 h-4" />
			View Leaderboard
		</a>
	</div>
</div>
`;
}

function getGamePageServer(): string {
	return `import { fail } from '@sveltejs/kit';
import { generateId } from 'lucia';
import { createLucia } from '$lib/server/auth';
import { createDb, scores } from '$lib/server/db';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ cookies, platform }) => {
	const sessionId = cookies.get('auth_session');

	if (!sessionId || !platform?.env?.DATABASE_URL) {
		return { user: null };
	}

	const db = createDb(platform.env.DATABASE_URL);
	const lucia = createLucia(db);
	const { user } = await lucia.validateSession(sessionId);

	return { user };
};

export const actions: Actions = {
	submitScore: async ({ request, cookies, platform }) => {
		const sessionId = cookies.get('auth_session');

		if (!sessionId || !platform?.env?.DATABASE_URL) {
			return fail(401, { error: 'You must be logged in to save scores' });
		}

		const db = createDb(platform.env.DATABASE_URL);
		const lucia = createLucia(db);
		const { user } = await lucia.validateSession(sessionId);

		if (!user) {
			return fail(401, { error: 'You must be logged in to save scores' });
		}

		const formData = await request.formData();
		const scoreValue = formData.get('score') as string;

		if (!scoreValue) {
			return fail(400, { error: 'Score is required' });
		}

		const score = parseInt(scoreValue, 10);
		if (isNaN(score) || score < 0) {
			return fail(400, { error: 'Invalid score' });
		}

		await db.insert(scores).values({
			id: generateId(15),
			userId: user.id,
			score: String(score)
		});

		return { success: true, score };
	}
};
`;
}

function getScoresPageServer(): string {
	return `import { createDb, scores, users } from '$lib/server/db';
import { desc, eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ platform }) => {
	const databaseUrl = platform?.env?.DATABASE_URL;

	if (!databaseUrl) {
		return { scores: [] };
	}

	const db = createDb(databaseUrl);

	const allScores = await db
		.select({
			id: scores.id,
			score: scores.score,
			createdAt: scores.createdAt,
			userName: users.name,
			userEmail: users.email
		})
		.from(scores)
		.leftJoin(users, eq(scores.userId, users.id))
		.orderBy(desc(scores.score))
		.limit(50);

	return { scores: allScores };
};
`;
}

function getScoresPageSvelte(): string {
	return `<script lang="ts">
	import { Trophy, ArrowLeft } from 'lucide-svelte';

	let { data } = $props();

	function formatDate(date: Date | string) {
		return new Date(date).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			hour: 'numeric',
			minute: '2-digit'
		});
	}
</script>

<svelte:head>
	<title>Leaderboard - Top Scores</title>
</svelte:head>

<div class="max-w-2xl mx-auto px-6 py-16">
	<div class="flex items-center gap-4 mb-8">
		<a href="/leaderboard" class="text-muted-foreground hover:text-foreground">
			<ArrowLeft class="w-5 h-5" />
		</a>
		<div>
			<h1 class="text-3xl font-semibold tracking-tight flex items-center gap-3">
				<Trophy class="w-8 h-8 text-amber-500" />
				Leaderboard
			</h1>
			<p class="text-muted-foreground mt-1">Top 50 scores</p>
		</div>
	</div>

	{#if data.scores.length === 0}
		<div class="border border-border rounded-lg p-8 text-center bg-background">
			<Trophy class="w-16 h-16 mx-auto text-muted-foreground mb-4" />
			<p class="text-muted-foreground mb-2">No scores yet!</p>
			<p class="text-sm text-muted-foreground">Be the first to play and set a high score.</p>
		</div>
	{:else}
		<div class="bg-background border border-border rounded-lg overflow-hidden">
			<table class="w-full">
				<thead class="bg-muted border-b border-border">
					<tr>
						<th class="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">Rank</th>
						<th class="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">Player</th>
						<th class="px-4 py-3 text-right text-sm font-semibold text-muted-foreground">Score</th>
						<th class="px-4 py-3 text-right text-sm font-semibold text-muted-foreground">Date</th>
					</tr>
				</thead>
				<tbody>
					{#each data.scores as score, i}
						<tr class="border-b border-border last:border-0 hover:bg-accent">
							<td class="px-4 py-3">
								{#if i === 0}
									<span class="text-2xl">🥇</span>
								{:else if i === 1}
									<span class="text-2xl">🥈</span>
								{:else if i === 2}
									<span class="text-2xl">🥉</span>
								{:else}
									<span class="text-muted-foreground font-medium">{i + 1}</span>
								{/if}
							</td>
							<td class="px-4 py-3">
								<p class="font-medium">{score.userName || 'Anonymous'}</p>
								<p class="text-sm text-muted-foreground">{score.userEmail}</p>
							</td>
							<td class="px-4 py-3 text-right">
								<span class="font-bold text-lg text-blue-600">{score.score}</span>
							</td>
							<td class="px-4 py-3 text-right text-sm text-muted-foreground">
								{formatDate(score.createdAt)}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>
`;
}

export const leaderboardModule: FeatureModule = {
	name: 'leaderboard',
	async apply(config: ProjectConfig, outputDir: string) {
		console.log('  → Adding leaderboard module with click game');

		// Create routes
		await mkdir(join(outputDir, 'src', 'routes', 'leaderboard'), { recursive: true });
		await mkdir(join(outputDir, 'src', 'routes', 'leaderboard', 'scores'), { recursive: true });

		// Write route files
		await writeFile(join(outputDir, 'src', 'routes', 'leaderboard', '+page.svelte'), getGamePageSvelte());
		await writeFile(join(outputDir, 'src', 'routes', 'leaderboard', '+page.server.ts'), getGamePageServer());
		await writeFile(join(outputDir, 'src', 'routes', 'leaderboard', 'scores', '+page.svelte'), getScoresPageSvelte());
		await writeFile(join(outputDir, 'src', 'routes', 'leaderboard', 'scores', '+page.server.ts'), getScoresPageServer());

		// Update schema
		const schemaPath = join(outputDir, 'src', 'lib', 'server', 'db', 'schema.ts');
		try {
			let schema = await readFile(schemaPath, 'utf-8');
			if (!schema.includes('scores')) {
				schema += '\n' + getLeaderboardSchema();
				await writeFile(schemaPath, schema);
			}
		} catch {
			// Schema doesn't exist yet
		}

		// Update db index to export scores
		const dbIndexPath = join(outputDir, 'src', 'lib', 'server', 'db', 'index.ts');
		try {
			let dbIndex = await readFile(dbIndexPath, 'utf-8');
			if (!dbIndex.includes('scores')) {
				dbIndex = dbIndex.replace(
					/export \{([^}]*)\} from '.\/schema'/,
					(match, exports) => `export {${exports}, scores } from './schema'`
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
				'lucide-svelte': '^0.468.0',
				'svelte-sonner': '^0.3.28'
			};
			await writeFile(packageJsonPath, JSON.stringify(packageJson, null, '\t'));
		} catch {
			// Package.json doesn't exist
		}

		console.log('  → Leaderboard module created successfully');
	}
};
