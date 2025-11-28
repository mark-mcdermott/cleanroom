import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { ProjectConfig, FeatureModule } from '../../types';

// Blog posts schema (extends existing schema if auth module is present)
function getBlogSchema(): string {
	return `import { pgTable, text, timestamp, boolean } from 'drizzle-orm/pg-core';

// Blog posts table
export const posts = pgTable('posts', {
	id: text('id').primaryKey(),
	slug: text('slug').notNull().unique(),
	title: text('title').notNull(),
	excerpt: text('excerpt'),
	content: text('content').notNull(),
	coverImage: text('cover_image'),
	published: boolean('published').notNull().default(false),
	authorId: text('author_id'),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
	publishedAt: timestamp('published_at', { withTimezone: true })
});

// Tags table
export const tags = pgTable('tags', {
	id: text('id').primaryKey(),
	name: text('name').notNull().unique(),
	slug: text('slug').notNull().unique()
});

// Post tags junction table
export const postTags = pgTable('post_tags', {
	postId: text('post_id')
		.notNull()
		.references(() => posts.id, { onDelete: 'cascade' }),
	tagId: text('tag_id')
		.notNull()
		.references(() => tags.id, { onDelete: 'cascade' })
});

// Type exports
export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;
`;
}

// Blog listing page server
function getBlogListingServer(): string {
	return `import { createDb, posts } from '$lib/server/db';
import { desc, eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ platform }) => {
	const databaseUrl = platform?.env?.DATABASE_URL;

	if (!databaseUrl) {
		return { posts: [] };
	}

	const db = createDb(databaseUrl);

	const allPosts = await db
		.select({
			id: posts.id,
			slug: posts.slug,
			title: posts.title,
			excerpt: posts.excerpt,
			coverImage: posts.coverImage,
			publishedAt: posts.publishedAt,
			createdAt: posts.createdAt
		})
		.from(posts)
		.where(eq(posts.published, true))
		.orderBy(desc(posts.publishedAt));

	return { posts: allPosts };
};
`;
}

// Blog listing page svelte
function getBlogListingSvelte(config: ProjectConfig): string {
	return `<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	function formatDate(date: Date | string | null) {
		if (!date) return '';
		const d = new Date(date);
		return d.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>Blog - ${config.projectName}</title>
	<meta name="description" content="Blog posts from ${config.projectName}" />
</svelte:head>

<div class="max-w-4xl mx-auto px-6 py-16">
	<h1 class="text-4xl font-semibold tracking-tight mb-8">Blog</h1>

	{#if data.posts.length === 0}
		<p class="text-zinc-600">No posts yet. Check back soon!</p>
	{:else}
		<div class="space-y-8">
			{#each data.posts as post}
				<article class="group">
					<a href="/blog/{post.slug}" class="block">
						{#if post.coverImage}
							<img
								src={post.coverImage}
								alt={post.title}
								class="w-full h-48 object-cover rounded-lg mb-4"
							/>
						{/if}
						<h2 class="text-2xl font-semibold group-hover:text-zinc-600 transition-colors">
							{post.title}
						</h2>
						{#if post.excerpt}
							<p class="text-zinc-600 mt-2">{post.excerpt}</p>
						{/if}
						<time class="text-sm text-zinc-500 mt-2 block">
							{formatDate(post.publishedAt || post.createdAt)}
						</time>
					</a>
				</article>
			{/each}
		</div>
	{/if}
</div>
`;
}

// Individual blog post page server
function getBlogPostServer(): string {
	return `import { error } from '@sveltejs/kit';
import { createDb, posts } from '$lib/server/db';
import { eq, and } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, platform }) => {
	const databaseUrl = platform?.env?.DATABASE_URL;

	if (!databaseUrl) {
		error(500, 'Database not configured');
	}

	const db = createDb(databaseUrl);

	const [post] = await db
		.select()
		.from(posts)
		.where(and(eq(posts.slug, params.slug), eq(posts.published, true)))
		.limit(1);

	if (!post) {
		error(404, 'Post not found');
	}

	return { post };
};
`;
}

// Individual blog post page svelte
function getBlogPostSvelte(config: ProjectConfig): string {
	return `<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	function formatDate(date: Date | string | null) {
		if (!date) return '';
		const d = new Date(date);
		return d.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>{data.post.title} - ${config.projectName}</title>
	<meta name="description" content={data.post.excerpt || data.post.title} />
</svelte:head>

<article class="max-w-3xl mx-auto px-6 py-16">
	<header class="mb-8">
		<a href="/blog" class="text-sm text-zinc-500 hover:text-zinc-700 mb-4 inline-block">
			&larr; Back to blog
		</a>
		<h1 class="text-4xl font-semibold tracking-tight mt-2">{data.post.title}</h1>
		<time class="text-zinc-500 mt-2 block">
			{formatDate(data.post.publishedAt || data.post.createdAt)}
		</time>
	</header>

	{#if data.post.coverImage}
		<img
			src={data.post.coverImage}
			alt={data.post.title}
			class="w-full h-64 object-cover rounded-lg mb-8"
		/>
	{/if}

	<div class="prose prose-zinc max-w-none">
		{@html data.post.content}
	</div>
</article>

<style>
	.prose :global(h2) {
		font-size: 1.5rem;
		font-weight: 600;
		margin-top: 2rem;
		margin-bottom: 1rem;
	}
	.prose :global(h3) {
		font-size: 1.25rem;
		font-weight: 600;
		margin-top: 1.5rem;
		margin-bottom: 0.75rem;
	}
	.prose :global(p) {
		margin-bottom: 1rem;
		line-height: 1.75;
	}
	.prose :global(ul), .prose :global(ol) {
		margin-bottom: 1rem;
		padding-left: 1.5rem;
	}
	.prose :global(li) {
		margin-bottom: 0.5rem;
	}
	.prose :global(code) {
		background: #f4f4f5;
		padding: 0.125rem 0.25rem;
		border-radius: 0.25rem;
		font-size: 0.875rem;
	}
	.prose :global(pre) {
		background: #18181b;
		color: #fafafa;
		padding: 1rem;
		border-radius: 0.5rem;
		overflow-x: auto;
		margin-bottom: 1rem;
	}
	.prose :global(pre code) {
		background: transparent;
		padding: 0;
	}
	.prose :global(blockquote) {
		border-left: 3px solid #e4e4e7;
		padding-left: 1rem;
		font-style: italic;
		color: #71717a;
		margin-bottom: 1rem;
	}
	.prose :global(a) {
		color: #18181b;
		text-decoration: underline;
	}
	.prose :global(a:hover) {
		color: #52525b;
	}
</style>
`;
}

// Blog seed script
function getBlogSeedScript(): string {
	return `import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { generateId } from 'lucia';
import { posts } from './src/lib/server/db/schema';

if (!process.env.DATABASE_URL) {
	throw new Error('DATABASE_URL environment variable is required');
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

const samplePosts = [
	{
		id: generateId(15),
		slug: 'hello-world',
		title: 'Hello World',
		excerpt: 'Welcome to our blog! This is our first post.',
		content: \`
<h2>Welcome!</h2>
<p>This is our first blog post. We're excited to share our thoughts and ideas with you.</p>

<h3>What to expect</h3>
<p>We'll be posting about:</p>
<ul>
<li>Technology and development</li>
<li>Design and user experience</li>
<li>Tips and tutorials</li>
</ul>

<p>Stay tuned for more content!</p>
\`.trim(),
		published: true,
		publishedAt: new Date()
	},
	{
		id: generateId(15),
		slug: 'getting-started',
		title: 'Getting Started Guide',
		excerpt: 'Learn how to get the most out of our platform.',
		content: \`
<h2>Quick Start</h2>
<p>Getting started is easy. Just follow these simple steps:</p>

<ol>
<li>Create an account</li>
<li>Explore the dashboard</li>
<li>Start creating content</li>
</ol>

<h3>Need help?</h3>
<p>Check out our documentation or reach out to our support team.</p>

<blockquote>
Pro tip: Bookmark this page for quick reference!
</blockquote>
\`.trim(),
		published: true,
		publishedAt: new Date(Date.now() - 86400000) // Yesterday
	}
];

async function seed() {
	console.log('Seeding blog posts...');

	for (const post of samplePosts) {
		await db.insert(posts).values(post).onConflictDoNothing();
		console.log(\`Created post: \${post.title}\`);
	}

	console.log('Done!');
}

seed().catch(console.error);
`;
}

export const blogModule: FeatureModule = {
	name: 'blog',
	async apply(config: ProjectConfig, outputDir: string) {
		// Create directory structure
		await mkdir(join(outputDir, 'src', 'routes', 'blog', '[slug]'), { recursive: true });
		await mkdir(join(outputDir, 'scripts'), { recursive: true });

		// Check if db schema already exists (from auth module)
		const schemaPath = join(outputDir, 'src', 'lib', 'server', 'db', 'schema.ts');
		let existingSchema = '';
		try {
			existingSchema = await readFile(schemaPath, 'utf-8');
		} catch {
			// Schema doesn't exist, create db directory
			await mkdir(join(outputDir, 'src', 'lib', 'server', 'db'), { recursive: true });
		}

		// Append blog schema to existing or create new
		if (existingSchema) {
			// Append blog tables to existing schema
			const blogSchemaAddition = `
// Blog posts table
export const posts = pgTable('posts', {
	id: text('id').primaryKey(),
	slug: text('slug').notNull().unique(),
	title: text('title').notNull(),
	excerpt: text('excerpt'),
	content: text('content').notNull(),
	coverImage: text('cover_image'),
	published: boolean('published').notNull().default(false),
	authorId: text('author_id'),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
	publishedAt: timestamp('published_at', { withTimezone: true })
});

// Tags table
export const tags = pgTable('tags', {
	id: text('id').primaryKey(),
	name: text('name').notNull().unique(),
	slug: text('slug').notNull().unique()
});

// Post tags junction table
export const postTags = pgTable('post_tags', {
	postId: text('post_id')
		.notNull()
		.references(() => posts.id, { onDelete: 'cascade' }),
	tagId: text('tag_id')
		.notNull()
		.references(() => tags.id, { onDelete: 'cascade' })
});

// Blog type exports
export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;
`;
			// Add boolean import if not present
			let updatedSchema = existingSchema;
			if (!existingSchema.includes('boolean')) {
				updatedSchema = existingSchema.replace(
					"import { pgTable, text, timestamp }",
					"import { pgTable, text, timestamp, boolean }"
				);
			}
			await writeFile(schemaPath, updatedSchema + blogSchemaAddition);
		} else {
			// Create fresh schema with blog tables (also need db index)
			await writeFile(schemaPath, getBlogSchema());

			// Create db index if it doesn't exist
			const dbIndexContent = `import { neon } from '@neondatabase/serverless';
import { drizzle, type NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from './schema';

export function createDb(databaseUrl: string) {
	const sql = neon(databaseUrl);
	return drizzle(sql, { schema });
}

export type Database = NeonHttpDatabase<typeof schema>;
export * from './schema';
`;
			await writeFile(join(outputDir, 'src', 'lib', 'server', 'db', 'index.ts'), dbIndexContent);
		}

		// Write blog routes
		await writeFile(join(outputDir, 'src', 'routes', 'blog', '+page.server.ts'), getBlogListingServer());
		await writeFile(join(outputDir, 'src', 'routes', 'blog', '+page.svelte'), getBlogListingSvelte(config));
		await writeFile(join(outputDir, 'src', 'routes', 'blog', '[slug]', '+page.server.ts'), getBlogPostServer());
		await writeFile(join(outputDir, 'src', 'routes', 'blog', '[slug]', '+page.svelte'), getBlogPostSvelte(config));

		// Write seed script
		await writeFile(join(outputDir, 'scripts', 'seed-blog.ts'), getBlogSeedScript());

		// Update package.json with blog-related dependencies and scripts
		const packageJsonPath = join(outputDir, 'package.json');
		const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf-8'));

		// Add dependencies if not already present (auth module may have added them)
		packageJson.dependencies = {
			...packageJson.dependencies,
			'drizzle-orm': '^0.38.3',
			'@neondatabase/serverless': '^0.10.4'
		};

		packageJson.devDependencies = {
			...packageJson.devDependencies,
			'drizzle-kit': '^0.30.1',
			'dotenv': '^16.4.7'
		};

		packageJson.scripts = {
			...packageJson.scripts,
			'db:generate': 'drizzle-kit generate',
			'db:push': 'drizzle-kit push',
			'db:studio': 'drizzle-kit studio',
			'db:seed-blog': 'npx tsx scripts/seed-blog.ts'
		};

		await writeFile(packageJsonPath, JSON.stringify(packageJson, null, '\t'));

		// Create drizzle config if it doesn't exist
		const drizzleConfigPath = join(outputDir, 'drizzle.config.ts');
		try {
			await readFile(drizzleConfigPath, 'utf-8');
		} catch {
			const drizzleConfig = `import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

if (!process.env.DATABASE_URL) {
	throw new Error('DATABASE_URL environment variable is required');
}

export default defineConfig({
	schema: './src/lib/server/db/schema.ts',
	out: './drizzle',
	dialect: 'postgresql',
	dbCredentials: {
		url: process.env.DATABASE_URL
	}
});
`;
			await writeFile(drizzleConfigPath, drizzleConfig);
		}
	}
};
