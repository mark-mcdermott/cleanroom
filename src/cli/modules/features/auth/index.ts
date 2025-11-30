import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { ProjectConfig, FeatureModule } from '../../types';

// Database schema with users and sessions
function getDbSchema(): string {
	return `import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

// Users table for authentication
export const users = pgTable('users', {
	id: text('id').primaryKey(),
	email: text('email').notNull().unique(),
	passwordHash: text('password_hash').notNull(),
	name: text('name'),
	avatarUrl: text('avatar_url'),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

// Sessions table for Lucia
export const sessions = pgTable('sessions', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull()
});

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
`;
}

// Database index file
function getDbIndex(): string {
	return `import { neon } from '@neondatabase/serverless';
import { drizzle, type NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from './schema';

export function createDb(databaseUrl: string) {
	const sql = neon(databaseUrl);
	return drizzle(sql, { schema });
}

export type Database = NeonHttpDatabase<typeof schema>;
export * from './schema';
`;
}

// Lucia auth configuration
function getAuthTs(): string {
	return `import { Lucia } from 'lucia';
import { DrizzlePostgreSQLAdapter } from '@lucia-auth/adapter-drizzle';
import { dev } from '$app/environment';
import { sessions, users, type Database } from '$lib/server/db';

export function createLucia(db: Database) {
	const adapter = new DrizzlePostgreSQLAdapter(db, sessions, users);

	return new Lucia(adapter, {
		sessionCookie: {
			attributes: {
				secure: !dev
			}
		},
		getUserAttributes: (attributes) => ({
			email: attributes.email,
			name: attributes.name,
			avatarUrl: attributes.avatarUrl
		})
	});
}

declare module 'lucia' {
	interface Register {
		Lucia: ReturnType<typeof createLucia>;
		DatabaseUserAttributes: DatabaseUserAttributes;
	}
}

interface DatabaseUserAttributes {
	email: string;
	name: string | null;
	avatarUrl: string | null;
}
`;
}

// PBKDF2 password hashing (Cloudflare Workers compatible)
function getPasswordTs(): string {
	return `// PBKDF2-based password hashing using Web Crypto API
// Compatible with Cloudflare Workers edge runtime

const ITERATIONS = 100000;
const KEY_LENGTH = 32;
const SALT_LENGTH = 16;

function arrayBufferToBase64(buffer: ArrayBuffer): string {
	const bytes = new Uint8Array(buffer);
	let binary = '';
	for (let i = 0; i < bytes.byteLength; i++) {
		binary += String.fromCharCode(bytes[i]);
	}
	return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
	const binary = atob(base64);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) {
		bytes[i] = binary.charCodeAt(i);
	}
	return bytes.buffer;
}

export async function hashPassword(password: string): Promise<string> {
	const encoder = new TextEncoder();
	const passwordBuffer = encoder.encode(password);

	// Generate random salt
	const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));

	// Import password as key
	const keyMaterial = await crypto.subtle.importKey('raw', passwordBuffer, 'PBKDF2', false, [
		'deriveBits'
	]);

	// Derive key using PBKDF2
	const derivedBits = await crypto.subtle.deriveBits(
		{
			name: 'PBKDF2',
			salt: salt,
			iterations: ITERATIONS,
			hash: 'SHA-256'
		},
		keyMaterial,
		KEY_LENGTH * 8
	);

	// Combine salt and hash into a single string
	const saltBase64 = arrayBufferToBase64(salt.buffer);
	const hashBase64 = arrayBufferToBase64(derivedBits);

	return \`pbkdf2:\${ITERATIONS}:\${saltBase64}:\${hashBase64}\`;
}

export async function verifyPassword(storedHash: string, password: string): Promise<boolean> {
	const encoder = new TextEncoder();
	const passwordBuffer = encoder.encode(password);

	// Parse stored hash
	const parts = storedHash.split(':');
	if (parts.length !== 4 || parts[0] !== 'pbkdf2') {
		return false;
	}

	const iterations = parseInt(parts[1], 10);
	const salt = new Uint8Array(base64ToArrayBuffer(parts[2]));
	const storedHashBuffer = base64ToArrayBuffer(parts[3]);

	// Import password as key
	const keyMaterial = await crypto.subtle.importKey('raw', passwordBuffer, 'PBKDF2', false, [
		'deriveBits'
	]);

	// Derive key using same parameters
	const derivedBits = await crypto.subtle.deriveBits(
		{
			name: 'PBKDF2',
			salt: salt,
			iterations: iterations,
			hash: 'SHA-256'
		},
		keyMaterial,
		KEY_LENGTH * 8
	);

	// Compare hashes (constant-time comparison)
	const derivedArray = new Uint8Array(derivedBits);
	const storedArray = new Uint8Array(storedHashBuffer);

	if (derivedArray.length !== storedArray.length) {
		return false;
	}

	let result = 0;
	for (let i = 0; i < derivedArray.length; i++) {
		result |= derivedArray[i] ^ storedArray[i];
	}

	return result === 0;
}
`;
}

// Hooks server file
function getHooksServer(): string {
	return `import { createLucia } from '$lib/server/auth';
import { createDb } from '$lib/server/db';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const databaseUrl = event.platform?.env?.DATABASE_URL;

	if (!databaseUrl) {
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	const db = createDb(databaseUrl);
	const lucia = createLucia(db);

	const sessionId = event.cookies.get(lucia.sessionCookieName);

	if (!sessionId) {
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	const { session, user } = await lucia.validateSession(sessionId);

	if (session?.fresh) {
		const sessionCookie = lucia.createSessionCookie(session.id);
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});
	}

	if (!session) {
		const sessionCookie = lucia.createBlankSessionCookie();
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});
	}

	event.locals.user = user;
	event.locals.session = session;
	return resolve(event);
};
`;
}

// App.d.ts with locals types
function getAppDts(): string {
	return `// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: import('lucia').User | null;
			session: import('lucia').Session | null;
		}
		// interface PageData {}
		// interface PageState {}
		interface Platform {
			env?: {
				DATABASE_URL?: string;
			};
		}
	}
}

export {};
`;
}

// Login page server
function getLoginPageServer(): string {
	return `import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { createLucia } from '$lib/server/auth';
import { createDb, users } from '$lib/server/db';
import { verifyPassword } from '$lib/server/password';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) {
		redirect(302, '/');
	}
};

export const actions: Actions = {
	default: async ({ request, cookies, platform }) => {
		const formData = await request.formData();
		const email = formData.get('email');
		const password = formData.get('password');

		// Validate inputs
		if (typeof email !== 'string' || !email.includes('@')) {
			return fail(400, { error: 'Invalid email address' });
		}

		if (typeof password !== 'string' || password.length < 1) {
			return fail(400, { error: 'Password is required' });
		}

		const databaseUrl = platform?.env?.DATABASE_URL;
		if (!databaseUrl) {
			return fail(500, { error: 'Database not configured' });
		}

		const db = createDb(databaseUrl);
		const lucia = createLucia(db);

		// Find user
		const [existingUser] = await db
			.select()
			.from(users)
			.where(eq(users.email, email.toLowerCase()))
			.limit(1);

		if (!existingUser) {
			return fail(400, { error: 'Invalid email or password' });
		}

		// Verify password
		const validPassword = await verifyPassword(existingUser.passwordHash, password);

		if (!validPassword) {
			return fail(400, { error: 'Invalid email or password' });
		}

		// Create session
		const session = await lucia.createSession(existingUser.id, {});
		const sessionCookie = lucia.createSessionCookie(session.id);

		cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});

		redirect(302, '/');
	}
};
`;
}

// Login page svelte
function getLoginPageSvelte(config: ProjectConfig): string {
	return `<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<svelte:head>
	<title>Login - ${config.projectName}</title>
</svelte:head>

<div class="max-w-4xl mx-auto px-6 py-16">
	<h1 class="text-4xl font-semibold tracking-tight">Login</h1>

	<div class="mt-8 card max-w-md">
		<form method="POST" use:enhance class="space-y-4">
			{#if form?.error}
				<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
					{form.error}
				</div>
			{/if}

			<div>
				<label for="email" class="block text-sm font-medium text-muted-foreground mb-1">Email</label>
				<input
					type="email"
					id="email"
					name="email"
					required
					class="form-input w-full"
					placeholder="you@example.com"
				/>
			</div>

			<div>
				<label for="password" class="block text-sm font-medium text-muted-foreground mb-1">Password</label>
				<input
					type="password"
					id="password"
					name="password"
					required
					class="form-input w-full"
					placeholder="Your password"
				/>
			</div>

			<button type="submit" class="btn btn-dark w-full">Login</button>

			<p class="text-center text-sm text-muted-foreground">
				Don't have an account? <a href="/signup" class="text-foreground underline">Sign up</a>
			</p>
		</form>
	</div>
</div>
`;
}

// Signup page server
function getSignupPageServer(): string {
	return `import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { generateId } from 'lucia';
import { createLucia } from '$lib/server/auth';
import { createDb, users } from '$lib/server/db';
import { hashPassword } from '$lib/server/password';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) {
		redirect(302, '/');
	}
};

export const actions: Actions = {
	default: async ({ request, cookies, platform }) => {
		const formData = await request.formData();
		const email = formData.get('email');
		const password = formData.get('password');
		const name = formData.get('name');

		// Validate inputs
		if (typeof email !== 'string' || !email.includes('@')) {
			return fail(400, { error: 'Invalid email address' });
		}

		if (typeof password !== 'string' || password.length < 8) {
			return fail(400, { error: 'Password must be at least 8 characters' });
		}

		const databaseUrl = platform?.env?.DATABASE_URL;
		if (!databaseUrl) {
			return fail(500, { error: 'Database not configured' });
		}

		const db = createDb(databaseUrl);
		const lucia = createLucia(db);

		// Check if user already exists
		const [existingUser] = await db
			.select()
			.from(users)
			.where(eq(users.email, email.toLowerCase()))
			.limit(1);

		if (existingUser) {
			return fail(400, { error: 'Email already registered' });
		}

		// Create user
		const userId = generateId(15);
		const passwordHash = await hashPassword(password);

		await db.insert(users).values({
			id: userId,
			email: email.toLowerCase(),
			passwordHash,
			name: typeof name === 'string' && name.length > 0 ? name : null
		});

		// Create session
		const session = await lucia.createSession(userId, {});
		const sessionCookie = lucia.createSessionCookie(session.id);

		cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});

		redirect(302, '/');
	}
};
`;
}

// Signup page svelte
function getSignupPageSvelte(config: ProjectConfig): string {
	return `<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<svelte:head>
	<title>Sign Up - ${config.projectName}</title>
</svelte:head>

<div class="max-w-4xl mx-auto px-6 py-16">
	<h1 class="text-4xl font-semibold tracking-tight">Sign Up</h1>

	<div class="mt-8 card max-w-md">
		<form method="POST" use:enhance class="space-y-4">
			{#if form?.error}
				<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
					{form.error}
				</div>
			{/if}

			<div>
				<label for="name" class="block text-sm font-medium text-muted-foreground mb-1">Name (optional)</label>
				<input
					type="text"
					id="name"
					name="name"
					class="form-input w-full"
					placeholder="Your name"
				/>
			</div>

			<div>
				<label for="email" class="block text-sm font-medium text-muted-foreground mb-1">Email</label>
				<input
					type="email"
					id="email"
					name="email"
					required
					class="form-input w-full"
					placeholder="you@example.com"
				/>
			</div>

			<div>
				<label for="password" class="block text-sm font-medium text-muted-foreground mb-1">Password</label>
				<input
					type="password"
					id="password"
					name="password"
					required
					minlength="8"
					class="form-input w-full"
					placeholder="At least 8 characters"
				/>
			</div>

			<button type="submit" class="btn btn-dark w-full">Sign Up</button>

			<p class="text-center text-sm text-muted-foreground">
				Already have an account? <a href="/login" class="text-foreground underline">Login</a>
			</p>
		</form>
	</div>
</div>
`;
}

// Logout page server
function getLogoutPageServer(): string {
	return `import { redirect } from '@sveltejs/kit';
import { createLucia } from '$lib/server/auth';
import { createDb } from '$lib/server/db';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ cookies, locals, platform }) => {
		if (!locals.session) {
			redirect(302, '/');
		}

		const databaseUrl = platform?.env?.DATABASE_URL;
		if (!databaseUrl) {
			redirect(302, '/');
		}

		const db = createDb(databaseUrl);
		const lucia = createLucia(db);

		await lucia.invalidateSession(locals.session.id);

		const sessionCookie = lucia.createBlankSessionCookie();
		cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});

		redirect(302, '/');
	}
};
`;
}

// Drizzle config
function getDrizzleConfig(): string {
	return `import 'dotenv/config';
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
}

// .env.example file
function getEnvExample(): string {
	return `# Neon PostgreSQL connection string
DATABASE_URL=postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require
`;
}

export const authModule: FeatureModule = {
	name: 'auth',
	async apply(config: ProjectConfig, outputDir: string) {
		// Create directory structure
		await mkdir(join(outputDir, 'src', 'lib', 'server', 'db'), { recursive: true });
		await mkdir(join(outputDir, 'src', 'routes', 'login'), { recursive: true });
		await mkdir(join(outputDir, 'src', 'routes', 'signup'), { recursive: true });
		await mkdir(join(outputDir, 'src', 'routes', 'logout'), { recursive: true });

		// Write server files
		await writeFile(join(outputDir, 'src', 'lib', 'server', 'db', 'schema.ts'), getDbSchema());
		await writeFile(join(outputDir, 'src', 'lib', 'server', 'db', 'index.ts'), getDbIndex());
		await writeFile(join(outputDir, 'src', 'lib', 'server', 'auth.ts'), getAuthTs());
		await writeFile(join(outputDir, 'src', 'lib', 'server', 'password.ts'), getPasswordTs());

		// Write hooks
		await writeFile(join(outputDir, 'src', 'hooks.server.ts'), getHooksServer());

		// Update app.d.ts
		await writeFile(join(outputDir, 'src', 'app.d.ts'), getAppDts());

		// Write auth routes
		await writeFile(join(outputDir, 'src', 'routes', 'login', '+page.server.ts'), getLoginPageServer());
		await writeFile(join(outputDir, 'src', 'routes', 'login', '+page.svelte'), getLoginPageSvelte(config));
		await writeFile(join(outputDir, 'src', 'routes', 'signup', '+page.server.ts'), getSignupPageServer());
		await writeFile(join(outputDir, 'src', 'routes', 'signup', '+page.svelte'), getSignupPageSvelte(config));
		await writeFile(join(outputDir, 'src', 'routes', 'logout', '+page.server.ts'), getLogoutPageServer());

		// Write config files
		await writeFile(join(outputDir, 'drizzle.config.ts'), getDrizzleConfig());
		await writeFile(join(outputDir, '.env.example'), getEnvExample());

		// Write .env and .dev.vars files if database is configured
		// .env is for scripts (db:push, db:seed), .dev.vars is for Cloudflare local dev
		if (config.database) {
			const envContent = `DATABASE_URL=${config.database.connectionString}\n`;
			await writeFile(join(outputDir, '.env'), envContent);
			await writeFile(join(outputDir, '.dev.vars'), envContent);
		}

		// Update package.json with auth dependencies
		const packageJsonPath = join(outputDir, 'package.json');
		const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf-8'));

		packageJson.dependencies = {
			...packageJson.dependencies,
			'lucia': '^3.2.2',
			'@lucia-auth/adapter-drizzle': '^1.1.0',
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
			'db:studio': 'drizzle-kit studio'
		};

		await writeFile(packageJsonPath, JSON.stringify(packageJson, null, '\t'));
	}
};
