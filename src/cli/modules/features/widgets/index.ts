import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { ProjectConfig, FeatureModule } from '../../types';

// Helper to determine if site uses SSR (database)
function isSSRSite(config: ProjectConfig): boolean {
	return config.siteType === 'ssr-site';
}

// Entity naming configuration
interface WidgetEntityNames {
	widget: { singular: string; plural: string; pascalSingular: string; pascalPlural: string };
	thingy: { singular: string; plural: string; pascalSingular: string; pascalPlural: string };
}

function getDefaultEntityNames(): WidgetEntityNames {
	return {
		widget: { singular: 'widget', plural: 'widgets', pascalSingular: 'Widget', pascalPlural: 'Widgets' },
		thingy: { singular: 'thingy', plural: 'thingys', pascalSingular: 'Thingy', pascalPlural: 'Thingys' }
	};
}

// ============================================================================
// DATABASE SCHEMA
// ============================================================================

function getWidgetsSchema(names: WidgetEntityNames): string {
	return `// Demo ${names.widget.plural} - parent items owned by users
export const demo${names.widget.pascalPlural} = pgTable('demo_${names.widget.plural}', {
	id: text('id').primaryKey(),
	userId: text('user_id').notNull().references(() => demoUsers.id, { onDelete: 'cascade' }),
	name: text('name').notNull(),
	description: text('description'),
	customFields: text('custom_fields'),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

// Demo ${names.thingy.plural} - children belonging to ${names.widget.plural}
export const demo${names.thingy.pascalPlural} = pgTable('demo_${names.thingy.plural}', {
	id: text('id').primaryKey(),
	${names.widget.singular}Id: text('${names.widget.singular}_id').notNull().references(() => demo${names.widget.pascalPlural}.id, { onDelete: 'cascade' }),
	name: text('name').notNull(),
	description: text('description'),
	sortOrder: text('sort_order').notNull().default('0'),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

// Demo galleries - curated photo collections per ${names.widget.singular}
export const demoGalleries = pgTable('demo_galleries', {
	id: text('id').primaryKey(),
	${names.widget.singular}Id: text('${names.widget.singular}_id').notNull().references(() => demo${names.widget.pascalPlural}.id, { onDelete: 'cascade' }),
	name: text('name').notNull().default('Gallery'),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

// Demo notes - text notes attachable to ${names.widget.plural}/${names.thingy.plural}
export const demoNotes = pgTable('demo_notes', {
	id: text('id').primaryKey(),
	${names.widget.singular}Id: text('${names.widget.singular}_id').references(() => demo${names.widget.pascalPlural}.id, { onDelete: 'cascade' }),
	${names.thingy.singular}Id: text('${names.thingy.singular}_id').references(() => demo${names.thingy.pascalPlural}.id, { onDelete: 'cascade' }),
	content: text('content').notNull(),
	sortOrder: text('sort_order').notNull().default('0'),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

// Demo photos - images attachable to ${names.widget.plural}/${names.thingy.plural}/galleries
export const demoPhotos = pgTable('demo_photos', {
	id: text('id').primaryKey(),
	${names.widget.singular}Id: text('${names.widget.singular}_id').references(() => demo${names.widget.pascalPlural}.id, { onDelete: 'cascade' }),
	${names.thingy.singular}Id: text('${names.thingy.singular}_id').references(() => demo${names.thingy.pascalPlural}.id, { onDelete: 'cascade' }),
	galleryId: text('gallery_id').references(() => demoGalleries.id, { onDelete: 'cascade' }),
	url: text('url').notNull(),
	caption: text('caption'),
	filename: text('filename'),
	mimeType: text('mime_type'),
	sortOrder: text('sort_order').notNull().default('0'),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

// ${names.widget.pascalSingular} type exports
export type Demo${names.widget.pascalSingular} = typeof demo${names.widget.pascalPlural}.$inferSelect;
export type NewDemo${names.widget.pascalSingular} = typeof demo${names.widget.pascalPlural}.$inferInsert;
export type Demo${names.thingy.pascalSingular} = typeof demo${names.thingy.pascalPlural}.$inferSelect;
export type NewDemo${names.thingy.pascalSingular} = typeof demo${names.thingy.pascalPlural}.$inferInsert;
export type DemoGallery = typeof demoGalleries.$inferSelect;
export type NewDemoGallery = typeof demoGalleries.$inferInsert;
export type DemoNote = typeof demoNotes.$inferSelect;
export type NewDemoNote = typeof demoNotes.$inferInsert;
export type DemoPhoto = typeof demoPhotos.$inferSelect;
export type NewDemoPhoto = typeof demoPhotos.$inferInsert;
`;
}

// ============================================================================
// PHOTO API ROUTE
// ============================================================================

function getPhotoApiRoute(): string {
	return `import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, platform }) => {
	const { photoId } = params;

	if (!platform?.env?.WIDGET_PHOTOS) {
		error(500, 'R2 storage not configured');
	}

	const object = await platform.env.WIDGET_PHOTOS.get(\`photos/\${photoId}\`);

	if (!object) {
		error(404, 'Photo not found');
	}

	const headers = new Headers();
	headers.set('Content-Type', object.httpMetadata?.contentType || 'image/jpeg');
	headers.set('Cache-Control', 'public, max-age=31536000, immutable');
	headers.set('ETag', object.etag);

	return new Response(object.body, { headers });
};
`;
}

// ============================================================================
// MODULE LAYOUT
// ============================================================================

function getModuleLayoutServer(names: WidgetEntityNames): string {
	return `import { createDemoLucia } from '$lib/server/auth';
import { createDb, demoUsers, demo${names.widget.pascalPlural} } from '$lib/server/db';
import { eq, count } from 'drizzle-orm';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies, platform }) => {
	const sessionId = cookies.get('demo_auth_session');

	if (!sessionId || !platform?.env?.DATABASE_URL) {
		return { currentUser: null, isAdmin: false, ${names.widget.singular}Count: 0 };
	}

	const db = createDb(platform.env.DATABASE_URL);
	const lucia = createDemoLucia(db);
	const { user } = await lucia.validateSession(sessionId);

	if (!user) {
		return { currentUser: null, isAdmin: false, ${names.widget.singular}Count: 0 };
	}

	const [{ ${names.widget.singular}Count }] = await db.select({ ${names.widget.singular}Count: count() }).from(demo${names.widget.pascalPlural}).where(eq(demo${names.widget.pascalPlural}.userId, user.id));

	return {
		currentUser: { id: user.id, name: user.name, email: user.email, admin: user.admin },
		isAdmin: user.admin,
		${names.widget.singular}Count
	};
};
`;
}

function getModuleLayoutSvelte(names: WidgetEntityNames): string {
	return `<script lang="ts">
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui';
	import { ArrowLeft, Shield, User, Package } from 'lucide-svelte';

	let { data, children } = $props();

	const isAdminRoute = $derived($page.url.pathname.includes('/admin'));
</script>

<div class="min-h-screen bg-zinc-50">
	<header class="bg-white border-b border-zinc-200 sticky top-0 z-10">
		<div class="max-w-6xl mx-auto px-6 py-4">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-4">
					<a href="/sites/demo" class="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300">
						<ArrowLeft class="w-4 h-4 inline mr-1" />Demo Home
					</a>
					<span class="text-zinc-300">|</span>
					<a href="/modules/${names.widget.plural}" class="flex items-center gap-2 text-lg font-semibold">
						<Package class="w-5 h-5 text-blue-500" />${names.widget.pascalPlural} Module
					</a>
				</div>
				<div class="flex items-center gap-3">
					{#if data.currentUser}
						<span class="text-sm text-zinc-600 dark:text-zinc-400">
							{data.currentUser.name || data.currentUser.email}
							{#if data.currentUser.admin}
								<span class="ml-1 text-amber-600">(Admin)</span>
							{/if}
						</span>
						{#if data.isAdmin}
							{#if isAdminRoute}
								<Button.Root variant="outline" size="sm" href="/modules/${names.widget.plural}/users/{data.currentUser.id}/${names.widget.plural}" class="cursor-pointer">
									<User class="w-4 h-4 mr-1" />User View
								</Button.Root>
							{:else}
								<Button.Root variant="outline" size="sm" href="/modules/${names.widget.plural}/admin" class="cursor-pointer">
									<Shield class="w-4 h-4 mr-1" />Admin
								</Button.Root>
							{/if}
						{/if}
					{:else}
						<Button.Root size="sm" href="/modules/auth/login" class="cursor-pointer">Log In</Button.Root>
					{/if}
				</div>
			</div>
		</div>
	</header>
	{@render children()}
</div>
`;
}

// ============================================================================
// LANDING PAGE
// ============================================================================

function getModuleLandingServer(names: WidgetEntityNames): string {
	return `import { redirect } from '@sveltejs/kit';
import { createDemoLucia } from '$lib/server/auth';
import { createDb, demoUsers } from '$lib/server/db';
import { asc } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies, platform }) => {
	const sessionId = cookies.get('demo_auth_session');

	if (!platform?.env?.DATABASE_URL) {
		return { needsSetup: true };
	}

	const db = createDb(platform.env.DATABASE_URL);

	if (sessionId) {
		const lucia = createDemoLucia(db);
		const { user } = await lucia.validateSession(sessionId);
		if (user) {
			redirect(302, \`/modules/${names.widget.plural}/users/\${user.id}/${names.widget.plural}\`);
		}
	}

	const [firstUser] = await db.select({ id: demoUsers.id }).from(demoUsers).orderBy(asc(demoUsers.email)).limit(1);

	if (firstUser) {
		redirect(302, \`/modules/${names.widget.plural}/users/\${firstUser.id}/${names.widget.plural}\`);
	}

	redirect(302, '/modules/auth/login');
};
`;
}

function getModuleLandingSvelte(): string {
	return `<script lang="ts">
	let { data } = $props();
</script>

<svelte:head><title>Loading...</title></svelte:head>

<div class="flex items-center justify-center min-h-[60vh]">
	{#if data.needsSetup}
		<div class="text-center">
			<p class="text-zinc-600 dark:text-zinc-400 mb-4">Database not configured.</p>
			<a href="/sites/demo" class="text-blue-600 hover:underline">Return to demo home</a>
		</div>
	{:else}
		<p class="text-zinc-500 dark:text-zinc-400">Redirecting...</p>
	{/if}
</div>
`;
}

// ============================================================================
// WIDGET LIST PAGE
// ============================================================================

function getWidgetListServer(names: WidgetEntityNames): string {
	return `import { fail, redirect } from '@sveltejs/kit';
import { generateIdFromEntropySize } from 'lucia';
import { eq, asc, count, and } from 'drizzle-orm';
import { createDemoLucia } from '$lib/server/auth';
import { createDb, demoUsers, demo${names.widget.pascalPlural}, demo${names.thingy.pascalPlural}, demoNotes, demoPhotos, demoGalleries } from '$lib/server/db';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params, cookies, platform }) => {
	const { userId } = params;

	if (!platform?.env?.DATABASE_URL) redirect(302, '/modules/${names.widget.plural}');

	const db = createDb(platform.env.DATABASE_URL);

	const [targetUser] = await db.select({ id: demoUsers.id, name: demoUsers.name, email: demoUsers.email })
		.from(demoUsers).where(eq(demoUsers.id, userId));
	if (!targetUser) redirect(302, '/modules/${names.widget.plural}');

	const ${names.widget.plural} = await db.select().from(demo${names.widget.pascalPlural})
		.where(eq(demo${names.widget.pascalPlural}.userId, userId)).orderBy(asc(demo${names.widget.pascalPlural}.name));

	const ${names.widget.plural}WithCounts = await Promise.all(${names.widget.plural}.map(async (w) => {
		const [{ ${names.thingy.singular}Count }] = await db.select({ ${names.thingy.singular}Count: count() }).from(demo${names.thingy.pascalPlural}).where(eq(demo${names.thingy.pascalPlural}.${names.widget.singular}Id, w.id));
		const [{ noteCount }] = await db.select({ noteCount: count() }).from(demoNotes).where(eq(demoNotes.${names.widget.singular}Id, w.id));
		const [{ photoCount }] = await db.select({ photoCount: count() }).from(demoPhotos).where(eq(demoPhotos.${names.widget.singular}Id, w.id));
		return { ...w, ${names.thingy.singular}Count, noteCount, photoCount };
	}));

	const sessionId = cookies.get('demo_auth_session');
	let currentUser = null;
	if (sessionId) {
		const lucia = createDemoLucia(db);
		const { user } = await lucia.validateSession(sessionId);
		if (user) currentUser = { id: user.id, admin: user.admin };
	}

	return { targetUser, ${names.widget.plural}: ${names.widget.plural}WithCounts, canEdit: currentUser?.id === userId || currentUser?.admin };
};

export const actions: Actions = {
	create: async ({ params, request, cookies, platform }) => {
		const { userId } = params;
		const sessionId = cookies.get('demo_auth_session');

		if (!sessionId || !platform?.env?.DATABASE_URL) return fail(401, { error: 'Not authenticated' });

		const db = createDb(platform.env.DATABASE_URL);
		const lucia = createDemoLucia(db);
		const { user } = await lucia.validateSession(sessionId);

		if (!user || (user.id !== userId && !user.admin)) return fail(403, { error: 'Not authorized' });

		const formData = await request.formData();
		const name = formData.get('name') as string;
		const description = formData.get('description') as string;

		if (!name?.trim()) return fail(400, { error: 'Name is required' });

		try {
			const id = generateIdFromEntropySize(10);
			await db.insert(demo${names.widget.pascalPlural}).values({ id, userId, name: name.trim(), description: description?.trim() || null });
			redirect(303, \`/modules/${names.widget.plural}/users/\${userId}/${names.widget.plural}/\${id}\`);
		} catch {
			return fail(500, { error: 'Failed to create ${names.widget.singular}' });
		}
	},

	delete: async ({ params, request, cookies, platform }) => {
		const { userId } = params;
		const sessionId = cookies.get('demo_auth_session');

		if (!sessionId || !platform?.env?.DATABASE_URL) return fail(401, { error: 'Not authenticated' });

		const db = createDb(platform.env.DATABASE_URL);
		const lucia = createDemoLucia(db);
		const { user } = await lucia.validateSession(sessionId);

		if (!user || (user.id !== userId && !user.admin)) return fail(403, { error: 'Not authorized' });

		const formData = await request.formData();
		const ${names.widget.singular}Id = formData.get('${names.widget.singular}Id') as string;

		if (!${names.widget.singular}Id) return fail(400, { error: '${names.widget.pascalSingular} ID required' });

		try {
			await db.delete(demo${names.widget.pascalPlural}).where(and(eq(demo${names.widget.pascalPlural}.id, ${names.widget.singular}Id), eq(demo${names.widget.pascalPlural}.userId, userId)));
			return { success: true };
		} catch {
			return fail(500, { error: 'Failed to delete ${names.widget.singular}' });
		}
	}
};
`;
}

function getWidgetListSvelte(names: WidgetEntityNames): string {
	return `<script lang="ts">
	import { goto } from '$app/navigation';
	import { enhance } from '$app/forms';
	import { Button, Input, Label, Textarea, Table } from '$lib/components/ui';
	import { Plus, Package, Layers, StickyNote, Image, Trash2 } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	let { data } = $props();
	let showForm = $state(false);
</script>

<svelte:head>
	<title>{data.targetUser.name || data.targetUser.email}'s ${names.widget.pascalPlural}</title>
</svelte:head>

<div class="max-w-4xl mx-auto px-6 py-16">
	<div class="flex items-center justify-between mb-8">
		<div>
			<h1 class="text-3xl font-semibold tracking-tight">{data.targetUser.name || data.targetUser.email}'s ${names.widget.pascalPlural}</h1>
			<p class="text-zinc-600 dark:text-zinc-400 mt-2">{data.${names.widget.plural}.length} ${names.widget.singular}{data.${names.widget.plural}.length !== 1 ? 's' : ''}</p>
		</div>
		{#if data.canEdit}
			<Button.Root onclick={() => showForm = !showForm} class="cursor-pointer">
				<Plus class="w-4 h-4 mr-2" />{showForm ? 'Cancel' : 'New ${names.widget.pascalSingular}'}
			</Button.Root>
		{/if}
	</div>

	{#if showForm && data.canEdit}
		<div class="bg-white border border-zinc-200 rounded-lg p-6 mb-8">
			<h2 class="text-lg font-semibold mb-4">Create ${names.widget.pascalSingular}</h2>
			<form method="POST" action="?/create" use:enhance={() => {
				return async ({ result }) => {
					if (result.type === 'redirect') { toast.success('${names.widget.pascalSingular} created!'); goto(result.location); }
					else if (result.type === 'failure') { toast.error((result.data as { error?: string })?.error || 'Failed'); }
				};
			}} class="space-y-4">
				<div class="space-y-2">
					<Label.Root for="name">Name *</Label.Root>
					<Input.Root id="name" name="name" placeholder="${names.widget.pascalSingular} name" required />
				</div>
				<div class="space-y-2">
					<Label.Root for="description">Description</Label.Root>
					<Textarea.Root id="description" name="description" placeholder="Optional description" rows={3} />
				</div>
				<Button.Root type="submit">Create ${names.widget.pascalSingular}</Button.Root>
			</form>
		</div>
	{/if}

	{#if data.${names.widget.plural}.length === 0}
		<div class="bg-white border border-zinc-200 rounded-lg p-8 text-center">
			<Package class="w-12 h-12 mx-auto text-zinc-300 mb-4" />
			<p class="text-zinc-600 dark:text-zinc-400 mb-4">No ${names.widget.plural} yet.</p>
			{#if data.canEdit}
				<Button.Root onclick={() => showForm = true} class="cursor-pointer">
					<Plus class="w-4 h-4 mr-2" />Create First ${names.widget.pascalSingular}
				</Button.Root>
			{/if}
		</div>
	{:else}
		<div class="bg-white border border-zinc-200 rounded-lg overflow-hidden">
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>${names.widget.pascalSingular}</Table.Head>
						<Table.Head>${names.thingy.pascalPlural}</Table.Head>
						<Table.Head>Notes</Table.Head>
						<Table.Head>Photos</Table.Head>
						<Table.Head>Created</Table.Head>
						{#if data.canEdit}<Table.Head></Table.Head>{/if}
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each data.${names.widget.plural} as ${names.widget.singular}}
						<Table.Row class="cursor-pointer" onclick={() => goto(\`/modules/${names.widget.plural}/users/\${data.targetUser.id}/${names.widget.plural}/\${${names.widget.singular}.id}\`)}>
							<Table.Cell>
								<div class="flex items-center gap-3">
									<Package class="w-5 h-5 text-blue-500" />
									<div>
										<p class="font-medium">{${names.widget.singular}.name}</p>
										{#if ${names.widget.singular}.description}
											<p class="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-1">{${names.widget.singular}.description}</p>
										{/if}
									</div>
								</div>
							</Table.Cell>
							<Table.Cell><span class="flex items-center gap-1"><Layers class="w-4 h-4 text-zinc-400" />{${names.widget.singular}.${names.thingy.singular}Count}</span></Table.Cell>
							<Table.Cell><span class="flex items-center gap-1"><StickyNote class="w-4 h-4 text-zinc-400" />{${names.widget.singular}.noteCount}</span></Table.Cell>
							<Table.Cell><span class="flex items-center gap-1"><Image class="w-4 h-4 text-zinc-400" />{${names.widget.singular}.photoCount}</span></Table.Cell>
							<Table.Cell class="text-zinc-500 dark:text-zinc-400">{new Date(${names.widget.singular}.createdAt).toLocaleDateString()}</Table.Cell>
							{#if data.canEdit}
								<Table.Cell onclick={(e: MouseEvent) => e.stopPropagation()}>
									<form method="POST" action="?/delete" use:enhance={() => {
										return async ({ result }) => {
											if (result.type === 'success') { toast.success('Deleted'); window.location.reload(); }
											else if (result.type === 'failure') { toast.error('Failed to delete'); }
										};
									}}>
										<input type="hidden" name="${names.widget.singular}Id" value={${names.widget.singular}.id} />
										<button type="submit" class="p-2 text-red-500 hover:bg-red-50 rounded cursor-pointer"><Trash2 class="w-4 h-4" /></button>
									</form>
								</Table.Cell>
							{/if}
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</div>
	{/if}
</div>
`;
}

// ============================================================================
// WIDGET DETAIL PAGE
// ============================================================================

function getWidgetDetailServer(names: WidgetEntityNames): string {
	return `import { fail, redirect } from '@sveltejs/kit';
import { generateIdFromEntropySize } from 'lucia';
import { eq, and, asc } from 'drizzle-orm';
import { createDemoLucia } from '$lib/server/auth';
import { createDb, demoUsers, demo${names.widget.pascalPlural}, demo${names.thingy.pascalPlural}, demoNotes, demoPhotos, demoGalleries } from '$lib/server/db';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params, cookies, platform }) => {
	const { userId, ${names.widget.singular}Id } = params;

	if (!platform?.env?.DATABASE_URL) redirect(302, '/modules/${names.widget.plural}');

	const db = createDb(platform.env.DATABASE_URL);

	const [${names.widget.singular}] = await db.select().from(demo${names.widget.pascalPlural})
		.where(and(eq(demo${names.widget.pascalPlural}.id, ${names.widget.singular}Id), eq(demo${names.widget.pascalPlural}.userId, userId)));
	if (!${names.widget.singular}) redirect(302, \`/modules/${names.widget.plural}/users/\${userId}/${names.widget.plural}\`);

	const [targetUser] = await db.select({ id: demoUsers.id, name: demoUsers.name }).from(demoUsers).where(eq(demoUsers.id, userId));

	const ${names.thingy.plural} = await db.select().from(demo${names.thingy.pascalPlural}).where(eq(demo${names.thingy.pascalPlural}.${names.widget.singular}Id, ${names.widget.singular}Id)).orderBy(asc(demo${names.thingy.pascalPlural}.sortOrder));
	const notes = await db.select().from(demoNotes).where(eq(demoNotes.${names.widget.singular}Id, ${names.widget.singular}Id)).orderBy(asc(demoNotes.sortOrder));
	const photos = await db.select().from(demoPhotos).where(eq(demoPhotos.${names.widget.singular}Id, ${names.widget.singular}Id)).orderBy(asc(demoPhotos.sortOrder));
	const [gallery] = await db.select().from(demoGalleries).where(eq(demoGalleries.${names.widget.singular}Id, ${names.widget.singular}Id));

	const sessionId = cookies.get('demo_auth_session');
	let currentUser = null;
	if (sessionId) {
		const lucia = createDemoLucia(db);
		const { user } = await lucia.validateSession(sessionId);
		if (user) currentUser = { id: user.id, admin: user.admin };
	}

	return { ${names.widget.singular}, targetUser, ${names.thingy.plural}, notes, photos, gallery, canEdit: currentUser?.id === userId || currentUser?.admin };
};

export const actions: Actions = {
	create${names.thingy.pascalSingular}: async ({ params, request, cookies, platform }) => {
		const { userId, ${names.widget.singular}Id } = params;
		const sessionId = cookies.get('demo_auth_session');

		if (!sessionId || !platform?.env?.DATABASE_URL) return fail(401, { error: 'Not authenticated' });

		const db = createDb(platform.env.DATABASE_URL);
		const lucia = createDemoLucia(db);
		const { user } = await lucia.validateSession(sessionId);

		if (!user || (user.id !== userId && !user.admin)) return fail(403, { error: 'Not authorized' });

		const formData = await request.formData();
		const name = formData.get('name') as string;
		const description = formData.get('description') as string;

		if (!name?.trim()) return fail(400, { error: 'Name is required' });

		try {
			const existing = await db.select().from(demo${names.thingy.pascalPlural}).where(eq(demo${names.thingy.pascalPlural}.${names.widget.singular}Id, ${names.widget.singular}Id));
			await db.insert(demo${names.thingy.pascalPlural}).values({
				id: generateIdFromEntropySize(10),
				${names.widget.singular}Id,
				name: name.trim(),
				description: description?.trim() || null,
				sortOrder: String(existing.length)
			});
			return { success: true };
		} catch {
			return fail(500, { error: 'Failed to create ${names.thingy.singular}' });
		}
	},

	addNote: async ({ params, request, cookies, platform }) => {
		const { userId, ${names.widget.singular}Id } = params;
		const sessionId = cookies.get('demo_auth_session');

		if (!sessionId || !platform?.env?.DATABASE_URL) return fail(401, { error: 'Not authenticated' });

		const db = createDb(platform.env.DATABASE_URL);
		const lucia = createDemoLucia(db);
		const { user } = await lucia.validateSession(sessionId);

		if (!user || (user.id !== userId && !user.admin)) return fail(403, { error: 'Not authorized' });

		const formData = await request.formData();
		const content = formData.get('content') as string;

		if (!content?.trim()) return fail(400, { error: 'Content is required' });

		try {
			const existing = await db.select().from(demoNotes).where(eq(demoNotes.${names.widget.singular}Id, ${names.widget.singular}Id));
			await db.insert(demoNotes).values({
				id: generateIdFromEntropySize(10),
				${names.widget.singular}Id,
				content: content.trim(),
				sortOrder: String(existing.length)
			});
			return { success: true };
		} catch {
			return fail(500, { error: 'Failed to add note' });
		}
	},

	deleteNote: async ({ params, request, cookies, platform }) => {
		const { userId } = params;
		const sessionId = cookies.get('demo_auth_session');

		if (!sessionId || !platform?.env?.DATABASE_URL) return fail(401, { error: 'Not authenticated' });

		const db = createDb(platform.env.DATABASE_URL);
		const lucia = createDemoLucia(db);
		const { user } = await lucia.validateSession(sessionId);

		if (!user || (user.id !== userId && !user.admin)) return fail(403, { error: 'Not authorized' });

		const formData = await request.formData();
		const noteId = formData.get('noteId') as string;

		if (!noteId) return fail(400, { error: 'Note ID required' });

		try {
			await db.delete(demoNotes).where(eq(demoNotes.id, noteId));
			return { success: true };
		} catch {
			return fail(500, { error: 'Failed to delete note' });
		}
	},

	addPhoto: async ({ params, request, cookies, platform }) => {
		const { userId, ${names.widget.singular}Id } = params;
		const sessionId = cookies.get('demo_auth_session');

		if (!sessionId || !platform?.env?.DATABASE_URL) return fail(401, { error: 'Not authenticated' });

		const db = createDb(platform.env.DATABASE_URL);
		const lucia = createDemoLucia(db);
		const { user } = await lucia.validateSession(sessionId);

		if (!user || (user.id !== userId && !user.admin)) return fail(403, { error: 'Not authorized' });

		const formData = await request.formData();
		const photo = formData.get('photo') as File;
		const caption = formData.get('caption') as string;

		if (!photo || photo.size === 0) return fail(400, { error: 'Photo is required' });

		const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
		if (!allowedTypes.includes(photo.type)) return fail(400, { error: 'Invalid file type' });
		if (photo.size > 5 * 1024 * 1024) return fail(400, { error: 'File too large (max 5MB)' });

		try {
			const photoId = generateIdFromEntropySize(10);
			let url = '';

			if (platform?.env?.WIDGET_PHOTOS) {
				const arrayBuffer = await photo.arrayBuffer();
				await platform.env.WIDGET_PHOTOS.put(\`photos/\${photoId}\`, arrayBuffer, { httpMetadata: { contentType: photo.type } });
				url = \`/api/${names.widget.plural}/photos/\${photoId}\`;
			} else {
				const arrayBuffer = await photo.arrayBuffer();
				const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
				url = \`data:\${photo.type};base64,\${base64}\`;
			}

			const existing = await db.select().from(demoPhotos).where(eq(demoPhotos.${names.widget.singular}Id, ${names.widget.singular}Id));
			await db.insert(demoPhotos).values({
				id: photoId, ${names.widget.singular}Id, url,
				caption: caption?.trim() || null,
				filename: photo.name, mimeType: photo.type,
				sortOrder: String(existing.length)
			});

			return { success: true };
		} catch {
			return fail(500, { error: 'Failed to add photo' });
		}
	},

	deletePhoto: async ({ params, request, cookies, platform }) => {
		const { userId } = params;
		const sessionId = cookies.get('demo_auth_session');

		if (!sessionId || !platform?.env?.DATABASE_URL) return fail(401, { error: 'Not authenticated' });

		const db = createDb(platform.env.DATABASE_URL);
		const lucia = createDemoLucia(db);
		const { user } = await lucia.validateSession(sessionId);

		if (!user || (user.id !== userId && !user.admin)) return fail(403, { error: 'Not authorized' });

		const formData = await request.formData();
		const photoId = formData.get('photoId') as string;

		if (!photoId) return fail(400, { error: 'Photo ID required' });

		try {
			if (platform?.env?.WIDGET_PHOTOS) await platform.env.WIDGET_PHOTOS.delete(\`photos/\${photoId}\`);
			await db.delete(demoPhotos).where(eq(demoPhotos.id, photoId));
			return { success: true };
		} catch {
			return fail(500, { error: 'Failed to delete photo' });
		}
	}
};
`;
}

function getWidgetDetailSvelte(names: WidgetEntityNames): string {
	return `<script lang="ts">
	import { goto } from '$app/navigation';
	import { enhance } from '$app/forms';
	import { Button, Input, Label, Textarea } from '$lib/components/ui';
	import { ArrowLeft, Plus, Layers, StickyNote, Image, Trash2, Edit, Images, Upload } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	let { data } = $props();
	let show${names.thingy.pascalSingular}Form = $state(false);
	let showNoteForm = $state(false);
	let showPhotoForm = $state(false);
	let uploading = $state(false);
	let previewUrl = $state<string | null>(null);

	function handleFileChange(e: Event) {
		const file = (e.target as HTMLInputElement).files?.[0];
		if (file) previewUrl = URL.createObjectURL(file);
	}
</script>

<svelte:head><title>{data.${names.widget.singular}.name}</title></svelte:head>

<div class="max-w-4xl mx-auto px-6 py-16">
	<a href="/modules/${names.widget.plural}/users/{data.targetUser.id}/${names.widget.plural}" class="inline-flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 mb-6">
		<ArrowLeft class="w-4 h-4" />Back to ${names.widget.plural}
	</a>

	<div class="flex items-start justify-between mb-8">
		<div>
			<h1 class="text-3xl font-semibold tracking-tight">{data.${names.widget.singular}.name}</h1>
			{#if data.${names.widget.singular}.description}<p class="text-zinc-600 dark:text-zinc-400 mt-2">{data.${names.widget.singular}.description}</p>{/if}
		</div>
		{#if data.canEdit}
			<div class="flex gap-2">
				<Button.Root variant="outline" href="/modules/${names.widget.plural}/users/{data.targetUser.id}/${names.widget.plural}/{data.${names.widget.singular}.id}/edit" class="cursor-pointer"><Edit class="w-4 h-4 mr-2" />Edit</Button.Root>
				<Button.Root variant="outline" href="/modules/${names.widget.plural}/users/{data.targetUser.id}/${names.widget.plural}/{data.${names.widget.singular}.id}/gallery" class="cursor-pointer"><Images class="w-4 h-4 mr-2" />Gallery</Button.Root>
			</div>
		{/if}
	</div>

	<!-- ${names.thingy.pascalPlural} Section -->
	<div class="mb-8">
		<div class="flex items-center justify-between mb-4">
			<h2 class="text-xl font-semibold flex items-center gap-2"><Layers class="w-5 h-5 text-zinc-400" />${names.thingy.pascalPlural} ({data.${names.thingy.plural}.length})</h2>
			{#if data.canEdit}<Button.Root variant="outline" size="sm" onclick={() => show${names.thingy.pascalSingular}Form = !show${names.thingy.pascalSingular}Form} class="cursor-pointer"><Plus class="w-4 h-4 mr-1" />{show${names.thingy.pascalSingular}Form ? 'Cancel' : 'Add'}</Button.Root>{/if}
		</div>

		{#if show${names.thingy.pascalSingular}Form && data.canEdit}
			<div class="bg-white border border-zinc-200 rounded-lg p-4 mb-4">
				<form method="POST" action="?/create${names.thingy.pascalSingular}" use:enhance={() => {
					return async ({ result }) => {
						if (result.type === 'success') { toast.success('${names.thingy.pascalSingular} created!'); show${names.thingy.pascalSingular}Form = false; window.location.reload(); }
						else if (result.type === 'failure') { toast.error((result.data as { error?: string })?.error || 'Failed'); }
					};
				}} class="flex gap-3">
					<Input.Root name="name" placeholder="${names.thingy.pascalSingular} name" required class="flex-1" />
					<Input.Root name="description" placeholder="Description (optional)" class="flex-1" />
					<Button.Root type="submit">Add</Button.Root>
				</form>
			</div>
		{/if}

		{#if data.${names.thingy.plural}.length === 0}
			<div class="bg-white border border-zinc-200 rounded-lg p-6 text-center text-zinc-500 dark:text-zinc-400">No ${names.thingy.plural} yet.</div>
		{:else}
			<div class="space-y-2">
				{#each data.${names.thingy.plural} as ${names.thingy.singular}}
					<a href="/modules/${names.widget.plural}/users/{data.targetUser.id}/${names.widget.plural}/{data.${names.widget.singular}.id}/${names.thingy.plural}/{${names.thingy.singular}.id}" class="flex items-center gap-3 p-4 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50">
						<Layers class="w-5 h-5 text-green-500" />
						<div class="flex-1">
							<p class="font-medium">{${names.thingy.singular}.name}</p>
							{#if ${names.thingy.singular}.description}<p class="text-sm text-zinc-500 dark:text-zinc-400">{${names.thingy.singular}.description}</p>{/if}
						</div>
					</a>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Notes Section -->
	<div class="mb-8">
		<div class="flex items-center justify-between mb-4">
			<h2 class="text-xl font-semibold flex items-center gap-2"><StickyNote class="w-5 h-5 text-zinc-400" />Notes ({data.notes.length})</h2>
			{#if data.canEdit}<Button.Root variant="outline" size="sm" onclick={() => showNoteForm = !showNoteForm} class="cursor-pointer"><Plus class="w-4 h-4 mr-1" />{showNoteForm ? 'Cancel' : 'Add'}</Button.Root>{/if}
		</div>

		{#if showNoteForm && data.canEdit}
			<div class="bg-white border border-zinc-200 rounded-lg p-4 mb-4">
				<form method="POST" action="?/addNote" use:enhance={() => {
					return async ({ result }) => {
						if (result.type === 'success') { toast.success('Note added!'); showNoteForm = false; window.location.reload(); }
						else if (result.type === 'failure') { toast.error((result.data as { error?: string })?.error || 'Failed'); }
					};
				}} class="space-y-3">
					<Textarea.Root name="content" placeholder="Write a note..." rows={3} required />
					<Button.Root type="submit">Add Note</Button.Root>
				</form>
			</div>
		{/if}

		{#if data.notes.length === 0}
			<div class="bg-white border border-zinc-200 rounded-lg p-6 text-center text-zinc-500 dark:text-zinc-400">No notes yet.</div>
		{:else}
			<div class="space-y-2">
				{#each data.notes as note}
					<div class="flex items-start gap-3 p-4 bg-white border border-zinc-200 rounded-lg">
						<StickyNote class="w-5 h-5 text-yellow-500 mt-0.5" />
						<p class="flex-1 whitespace-pre-wrap">{note.content}</p>
						{#if data.canEdit}
							<form method="POST" action="?/deleteNote" use:enhance={() => {
								return async ({ result }) => {
									if (result.type === 'success') { toast.success('Deleted'); window.location.reload(); }
									else if (result.type === 'failure') { toast.error('Failed'); }
								};
							}}>
								<input type="hidden" name="noteId" value={note.id} />
								<button type="submit" class="p-1 text-red-500 hover:bg-red-50 rounded cursor-pointer"><Trash2 class="w-4 h-4" /></button>
							</form>
						{/if}
					</div>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Photos Section -->
	<div>
		<div class="flex items-center justify-between mb-4">
			<h2 class="text-xl font-semibold flex items-center gap-2"><Image class="w-5 h-5 text-zinc-400" />Photos ({data.photos.length})</h2>
			{#if data.canEdit}<Button.Root variant="outline" size="sm" onclick={() => showPhotoForm = !showPhotoForm} class="cursor-pointer"><Plus class="w-4 h-4 mr-1" />{showPhotoForm ? 'Cancel' : 'Add'}</Button.Root>{/if}
		</div>

		{#if showPhotoForm && data.canEdit}
			<div class="bg-white border border-zinc-200 rounded-lg p-4 mb-4">
				<form method="POST" action="?/addPhoto" enctype="multipart/form-data" use:enhance={() => {
					uploading = true;
					return async ({ result }) => {
						uploading = false;
						if (result.type === 'success') { toast.success('Photo added!'); showPhotoForm = false; previewUrl = null; window.location.reload(); }
						else if (result.type === 'failure') { toast.error((result.data as { error?: string })?.error || 'Failed'); }
					};
				}} class="space-y-3">
					<div class="border-2 border-dashed border-zinc-300 rounded-lg p-4 text-center">
						{#if previewUrl}<img src={previewUrl} alt="Preview" class="max-h-32 mx-auto mb-2 rounded" />{:else}<Upload class="w-6 h-6 mx-auto text-zinc-400" />{/if}
						<Input.Root name="photo" type="file" accept="image/*" onchange={handleFileChange} class="mt-2" required />
					</div>
					<Input.Root name="caption" placeholder="Caption (optional)" />
					<Button.Root type="submit" disabled={uploading}>{uploading ? 'Uploading...' : 'Add Photo'}</Button.Root>
				</form>
			</div>
		{/if}

		{#if data.photos.length === 0}
			<div class="bg-white border border-zinc-200 rounded-lg p-6 text-center text-zinc-500 dark:text-zinc-400">No photos yet.</div>
		{:else}
			<div class="grid grid-cols-2 md:grid-cols-3 gap-4">
				{#each data.photos as photo}
					<div class="relative group aspect-square bg-zinc-100 rounded-lg overflow-hidden">
						<img src={photo.url} alt={photo.caption || 'Photo'} class="w-full h-full object-cover" />
						{#if photo.caption}
							<div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
								<p class="text-white text-sm line-clamp-2">{photo.caption}</p>
							</div>
						{/if}
						{#if data.canEdit}
							<form method="POST" action="?/deletePhoto" use:enhance={() => {
								return async ({ result }) => {
									if (result.type === 'success') { toast.success('Deleted'); window.location.reload(); }
									else if (result.type === 'failure') { toast.error('Failed'); }
								};
							}} class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
								<input type="hidden" name="photoId" value={photo.id} />
								<button type="submit" class="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 cursor-pointer"><Trash2 class="w-4 h-4" /></button>
							</form>
						{/if}
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>
`;
}

// ============================================================================
// ADMIN PAGE
// ============================================================================

function getAdminPageServer(names: WidgetEntityNames): string {
	return `import { fail, redirect } from '@sveltejs/kit';
import { generateIdFromEntropySize } from 'lucia';
import { asc, eq, count } from 'drizzle-orm';
import { createDemoLucia } from '$lib/server/auth';
import { createDb, demoUsers, demo${names.widget.pascalPlural}, demo${names.thingy.pascalPlural}, demoNotes, demoPhotos, demoGalleries, demoSessions } from '$lib/server/db';
import { hashPassword } from '$lib/server/password';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ cookies, platform }) => {
	const sessionId = cookies.get('demo_auth_session');

	if (!sessionId || !platform?.env?.DATABASE_URL) redirect(302, '/modules/auth/login');

	const db = createDb(platform.env.DATABASE_URL);
	const lucia = createDemoLucia(db);
	const { user } = await lucia.validateSession(sessionId);

	if (!user?.admin) redirect(302, '/modules/${names.widget.plural}');

	const users = await db.select({ id: demoUsers.id, name: demoUsers.name, email: demoUsers.email, admin: demoUsers.admin, createdAt: demoUsers.createdAt })
		.from(demoUsers).orderBy(asc(demoUsers.email));

	const usersWithCounts = await Promise.all(users.map(async (u) => {
		const [{ ${names.widget.singular}Count }] = await db.select({ ${names.widget.singular}Count: count() }).from(demo${names.widget.pascalPlural}).where(eq(demo${names.widget.pascalPlural}.userId, u.id));
		return { ...u, ${names.widget.singular}Count };
	}));

	const [{ total${names.widget.pascalPlural} }] = await db.select({ total${names.widget.pascalPlural}: count() }).from(demo${names.widget.pascalPlural});
	const [{ total${names.thingy.pascalPlural} }] = await db.select({ total${names.thingy.pascalPlural}: count() }).from(demo${names.thingy.pascalPlural});
	const [{ totalNotes }] = await db.select({ totalNotes: count() }).from(demoNotes);
	const [{ totalPhotos }] = await db.select({ totalPhotos: count() }).from(demoPhotos);
	const [{ totalGalleries }] = await db.select({ totalGalleries: count() }).from(demoGalleries);

	return {
		currentUser: { id: user.id, name: user.name, email: user.email, admin: user.admin },
		users: usersWithCounts,
		stats: { total${names.widget.pascalPlural}, total${names.thingy.pascalPlural}, totalNotes, totalPhotos, totalGalleries }
	};
};

export const actions: Actions = {
	reset: async ({ cookies, platform }) => {
		if (!platform?.env?.DATABASE_URL) return fail(500, { error: 'Database not configured' });

		const db = createDb(platform.env.DATABASE_URL);
		const lucia = createDemoLucia(db);

		try {
			await db.delete(demoPhotos);
			await db.delete(demoNotes);
			await db.delete(demoGalleries);
			await db.delete(demo${names.thingy.pascalPlural});
			await db.delete(demo${names.widget.pascalPlural});
			await db.delete(demoSessions);
			await db.delete(demoUsers);

			const passwordHash = await hashPassword('password123');

			const officeUsers = [
				{ id: generateIdFromEntropySize(10), email: 'michael@dundermifflin.com', name: 'Michael Scott', admin: true },
				{ id: generateIdFromEntropySize(10), email: 'dwight@dundermifflin.com', name: 'Dwight Schrute', admin: false },
				{ id: generateIdFromEntropySize(10), email: 'jim@dundermifflin.com', name: 'Jim Halpert', admin: false },
				{ id: generateIdFromEntropySize(10), email: 'pam@dundermifflin.com', name: 'Pam Beesly', admin: false }
			];

			for (const user of officeUsers) {
				await db.insert(demoUsers).values({ ...user, passwordHash });
			}

			const sample${names.widget.pascalPlural} = [
				{ name: "World's Best Boss Mug", description: 'My prized possession.' },
				{ name: 'Dundie Awards', description: 'Collection of prestigious Dundie awards.' },
				{ name: 'Prison Mike Costume', description: 'For when I need to scare people straight.' }
			];

			for (const ${names.widget.singular} of sample${names.widget.pascalPlural}) {
				const ${names.widget.singular}Id = generateIdFromEntropySize(10);
				await db.insert(demo${names.widget.pascalPlural}).values({ id: ${names.widget.singular}Id, userId: officeUsers[0].id, name: ${names.widget.singular}.name, description: ${names.widget.singular}.description });
				await db.insert(demo${names.thingy.pascalPlural}).values({ id: generateIdFromEntropySize(10), ${names.widget.singular}Id, name: 'Sample ${names.thingy.pascalSingular}', description: 'A sample ${names.thingy.singular}.', sortOrder: '0' });
				await db.insert(demoNotes).values({ id: generateIdFromEntropySize(10), ${names.widget.singular}Id, content: 'Sample note for this ${names.widget.singular}.', sortOrder: '0' });
			}

			const session = await lucia.createSession(officeUsers[0].id, {});
			const sessionCookie = lucia.createSessionCookie(session.id);

			cookies.set(sessionCookie.name, sessionCookie.value, { path: '.', ...sessionCookie.attributes });

			return { success: true };
		} catch {
			return fail(500, { error: 'Failed to reset demo' });
		}
	}
};
`;
}

function getAdminPageSvelte(names: WidgetEntityNames): string {
	return `<script lang="ts">
	import { goto } from '$app/navigation';
	import { enhance } from '$app/forms';
	import { Button, Table } from '$lib/components/ui';
	import { RotateCcw, Users, Layers, Package, StickyNote, Image, Images } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	let { data } = $props();
</script>

<svelte:head>
	<title>${names.widget.pascalPlural} Admin</title>
	<meta name="description" content="Admin dashboard for ${names.widget.plural} module" />
</svelte:head>

<div class="max-w-6xl mx-auto px-6 py-16">
	<div class="flex items-center justify-between mb-8">
		<div>
			<h1 class="text-3xl font-semibold tracking-tight">${names.widget.pascalPlural} Admin</h1>
			<p class="text-zinc-600 dark:text-zinc-400 mt-2">Manage all users and their ${names.widget.plural}</p>
		</div>
		<form method="POST" action="?/reset" use:enhance={() => {
			return async ({ result }) => {
				if (result.type === 'success') { toast.success('Demo reset! Logged in as Michael Scott.'); window.location.reload(); }
				else if (result.type === 'failure') { toast.error((result.data as { error?: string })?.error || 'Failed to reset'); }
			};
		}}>
			<Button.Root type="submit" variant="outline" class="cursor-pointer"><RotateCcw class="w-4 h-4 mr-2" />Reset Demo</Button.Root>
		</form>
	</div>

	<!-- Stats Grid -->
	<div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
		<div class="bg-white border border-zinc-200 rounded-lg p-4">
			<div class="flex items-center gap-3">
				<Package class="w-8 h-8 text-blue-500" />
				<div>
					<p class="text-2xl font-semibold">{data.stats.total${names.widget.pascalPlural}}</p>
					<p class="text-sm text-zinc-500 dark:text-zinc-400">${names.widget.pascalPlural}</p>
				</div>
			</div>
		</div>
		<div class="bg-white border border-zinc-200 rounded-lg p-4">
			<div class="flex items-center gap-3">
				<Layers class="w-8 h-8 text-green-500" />
				<div>
					<p class="text-2xl font-semibold">{data.stats.total${names.thingy.pascalPlural}}</p>
					<p class="text-sm text-zinc-500 dark:text-zinc-400">${names.thingy.pascalPlural}</p>
				</div>
			</div>
		</div>
		<div class="bg-white border border-zinc-200 rounded-lg p-4">
			<div class="flex items-center gap-3">
				<StickyNote class="w-8 h-8 text-yellow-500" />
				<div>
					<p class="text-2xl font-semibold">{data.stats.totalNotes}</p>
					<p class="text-sm text-zinc-500 dark:text-zinc-400">Notes</p>
				</div>
			</div>
		</div>
		<div class="bg-white border border-zinc-200 rounded-lg p-4">
			<div class="flex items-center gap-3">
				<Image class="w-8 h-8 text-purple-500" />
				<div>
					<p class="text-2xl font-semibold">{data.stats.totalPhotos}</p>
					<p class="text-sm text-zinc-500 dark:text-zinc-400">Photos</p>
				</div>
			</div>
		</div>
		<div class="bg-white border border-zinc-200 rounded-lg p-4">
			<div class="flex items-center gap-3">
				<Images class="w-8 h-8 text-pink-500" />
				<div>
					<p class="text-2xl font-semibold">{data.stats.totalGalleries}</p>
					<p class="text-sm text-zinc-500 dark:text-zinc-400">Galleries</p>
				</div>
			</div>
		</div>
	</div>

	<!-- Users Table -->
	<div class="bg-white border border-zinc-200 rounded-lg overflow-hidden">
		<div class="px-6 py-4 border-b border-zinc-200">
			<h2 class="text-lg font-semibold flex items-center gap-2"><Users class="w-5 h-5 text-zinc-400" />All Users ({data.users.length})</h2>
		</div>
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head>User</Table.Head>
					<Table.Head>Email</Table.Head>
					<Table.Head>Role</Table.Head>
					<Table.Head>${names.widget.pascalPlural}</Table.Head>
					<Table.Head>Joined</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each data.users as user}
					<Table.Row class="cursor-pointer" onclick={() => goto(\`/modules/${names.widget.plural}/users/\${user.id}/${names.widget.plural}\`)}>
						<Table.Cell>
							<div class="flex items-center gap-3">
								<div class="w-8 h-8 bg-zinc-100 rounded-full flex items-center justify-center text-sm font-medium">
									{user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
								</div>
								<span class="font-medium">{user.name || 'No name'}</span>
							</div>
						</Table.Cell>
						<Table.Cell class="text-zinc-600 dark:text-zinc-400">{user.email}</Table.Cell>
						<Table.Cell>
							{#if user.admin}
								<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">Admin</span>
							{:else}
								<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">User</span>
							{/if}
						</Table.Cell>
						<Table.Cell>{user.${names.widget.singular}Count}</Table.Cell>
						<Table.Cell class="text-zinc-500 dark:text-zinc-400">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>
</div>
`;
}

// ============================================================================
// SEED SCRIPT
// ============================================================================

function getWidgetsSeedScript(names: WidgetEntityNames): string {
	return `import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { demoUsers, demo${names.widget.pascalPlural}, demo${names.thingy.pascalPlural}, demoNotes, demoPhotos } from './src/lib/server/db/schema';
import { hash } from '@node-rs/argon2';

if (!process.env.DATABASE_URL) {
	throw new Error('DATABASE_URL environment variable is required');
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

function generateId(length: number = 16): string {
	const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
	let result = '';
	for (let i = 0; i < length; i++) {
		result += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return result;
}

async function seed() {
	console.log('Seeding ${names.widget.plural} data...');

	const passwordHash = await hash('password123', {
		memoryCost: 19456,
		timeCost: 2,
		outputLen: 32,
		parallelism: 1
	});

	const users = [
		{ id: generateId(), email: 'michael@dundermifflin.com', name: 'Michael Scott', admin: true },
		{ id: generateId(), email: 'dwight@dundermifflin.com', name: 'Dwight Schrute', admin: false },
		{ id: generateId(), email: 'jim@dundermifflin.com', name: 'Jim Halpert', admin: false },
		{ id: generateId(), email: 'pam@dundermifflin.com', name: 'Pam Beesly', admin: false }
	];

	for (const user of users) {
		await db.insert(demoUsers).values({ ...user, passwordHash }).onConflictDoNothing();
		console.log(\`Created user: \${user.name}\`);
	}

	const sample${names.widget.pascalPlural} = [
		{ name: "World's Best Boss Mug", description: 'My prized possession.' },
		{ name: 'Dundie Awards', description: 'Collection of prestigious Dundie awards.' },
		{ name: 'Prison Mike Costume', description: 'For when I need to scare people straight.' }
	];

	for (const ${names.widget.singular} of sample${names.widget.pascalPlural}) {
		const ${names.widget.singular}Id = generateId();
		await db.insert(demo${names.widget.pascalPlural}).values({ id: ${names.widget.singular}Id, userId: users[0].id, name: ${names.widget.singular}.name, description: ${names.widget.singular}.description });
		console.log(\`Created ${names.widget.singular}: \${${names.widget.singular}.name}\`);

		await db.insert(demo${names.thingy.pascalPlural}).values({ id: generateId(), ${names.widget.singular}Id, name: 'Sample ${names.thingy.pascalSingular}', description: 'A sample ${names.thingy.singular}.', sortOrder: '0' });
		await db.insert(demoNotes).values({ id: generateId(), ${names.widget.singular}Id, content: 'Sample note for this ${names.widget.singular}.', sortOrder: '0' });
	}

	console.log('Done!');
}

seed().catch(console.error);
`;
}

// ============================================================================
// MAIN MODULE EXPORT
// ============================================================================

export const widgetsModule: FeatureModule = {
	name: 'widgets',
	async apply(config: ProjectConfig, outputDir: string) {
		const useDatabase = isSSRSite(config);

		if (!useDatabase) {
			console.log('  → Widgets module requires SSR site type with database support');
			console.log('  → Skipping widgets module for static sites');
			return;
		}

		console.log('  → Generating widgets demo module');

		const names = getDefaultEntityNames();

		// Create directory structure
		const routesBase = join(outputDir, 'src', 'routes', 'modules', names.widget.plural);
		await mkdir(join(routesBase, 'users', '[userId]', names.widget.plural, '[' + names.widget.singular + 'Id]', names.thingy.plural, '[' + names.thingy.singular + 'Id]'), { recursive: true });
		await mkdir(join(routesBase, 'users', '[userId]', names.widget.plural, '[' + names.widget.singular + 'Id]', 'edit'), { recursive: true });
		await mkdir(join(routesBase, 'users', '[userId]', names.widget.plural, '[' + names.widget.singular + 'Id]', 'gallery'), { recursive: true });
		await mkdir(join(routesBase, 'admin'), { recursive: true });
		await mkdir(join(outputDir, 'src', 'routes', 'api', names.widget.plural, 'photos', '[photoId]'), { recursive: true });
		await mkdir(join(outputDir, 'scripts'), { recursive: true });

		// Check if db schema already exists
		const schemaPath = join(outputDir, 'src', 'lib', 'server', 'db', 'schema.ts');
		let existingSchema = '';
		try {
			existingSchema = await readFile(schemaPath, 'utf-8');
		} catch {
			await mkdir(join(outputDir, 'src', 'lib', 'server', 'db'), { recursive: true });
		}

		// Append widgets schema
		if (existingSchema) {
			await writeFile(schemaPath, existingSchema + '\n' + getWidgetsSchema(names));
		}

		// Write API route
		await writeFile(join(outputDir, 'src', 'routes', 'api', names.widget.plural, 'photos', '[photoId]', '+server.ts'), getPhotoApiRoute());

		// Write module layout
		await writeFile(join(routesBase, '+layout.server.ts'), getModuleLayoutServer(names));
		await writeFile(join(routesBase, '+layout.svelte'), getModuleLayoutSvelte(names));

		// Write landing page
		await writeFile(join(routesBase, '+page.server.ts'), getModuleLandingServer(names));
		await writeFile(join(routesBase, '+page.svelte'), getModuleLandingSvelte());

		// Write widget list page
		await writeFile(join(routesBase, 'users', '[userId]', names.widget.plural, '+page.server.ts'), getWidgetListServer(names));
		await writeFile(join(routesBase, 'users', '[userId]', names.widget.plural, '+page.svelte'), getWidgetListSvelte(names));

		// Write widget detail page
		await writeFile(join(routesBase, 'users', '[userId]', names.widget.plural, '[' + names.widget.singular + 'Id]', '+page.server.ts'), getWidgetDetailServer(names));
		await writeFile(join(routesBase, 'users', '[userId]', names.widget.plural, '[' + names.widget.singular + 'Id]', '+page.svelte'), getWidgetDetailSvelte(names));

		// Write admin page
		await writeFile(join(routesBase, 'admin', '+page.server.ts'), getAdminPageServer(names));
		await writeFile(join(routesBase, 'admin', '+page.svelte'), getAdminPageSvelte(names));

		// Write seed script
		await writeFile(join(outputDir, 'scripts', 'seed-widgets.ts'), getWidgetsSeedScript(names));

		// Update package.json
		const packageJsonPath = join(outputDir, 'package.json');
		const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf-8'));

		packageJson.scripts = {
			...packageJson.scripts,
			'db:seed-widgets': 'npx tsx scripts/seed-widgets.ts'
		};

		await writeFile(packageJsonPath, JSON.stringify(packageJson, null, '\t'));

		console.log('  → Widgets module created successfully');
		console.log('  → Run "pnpm db:push" to create tables');
		console.log('  → Run "pnpm db:seed-widgets" to add sample data');
	}
};
