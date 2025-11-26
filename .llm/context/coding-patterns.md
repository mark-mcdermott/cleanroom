# Coding Patterns

## Svelte 5 Patterns

### Runes
- Use `$state()` for reactive state declarations
- Use `$derived()` for computed values
- Use `$effect()` for side effects (replaces onMount/afterUpdate)
- Use `$props()` for component props
- Use `$bindable()` for two-way binding props

### Component Structure
- Keep components small and focused
- Co-locate related logic within components
- Extract reusable logic into utility functions or stores
- Use snippets for reusable template fragments

### Reactivity
- Prefer derived state over manual updates
- Use stores for shared state across components
- Keep effects minimal and focused on side effects only

## SvelteKit Patterns

### Data Loading
- Use `+page.server.ts` for server-side data loading
- Use `+page.ts` for universal (client + server) loading
- Return typed data from load functions
- Handle errors with `error()` helper

### Form Handling
- Use SvelteKit form actions for mutations
- Integrate superforms with Zod for validation
- Use progressive enhancement (forms work without JS)

### API Routes
- Use `+server.ts` for REST API endpoints
- Return JSON responses with proper status codes
- Handle authentication in hooks or middleware

## Drizzle ORM Patterns

### Schema Definition
```typescript
// src/lib/server/db/schema.ts
import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const notes = pgTable('notes', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

### Database Client Setup
```typescript
// src/lib/server/db/index.ts
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
```

### Database Queries
```typescript
import { db } from '$lib/server/db';
import { notes } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

// Select with filter
const userNotes = await db
  .select()
  .from(notes)
  .where(eq(notes.userId, userId));

// Insert
const [newNote] = await db
  .insert(notes)
  .values({ userId, title, content })
  .returning();

// Update
await db
  .update(notes)
  .set({ title, content })
  .where(eq(notes.id, noteId));

// Delete
await db.delete(notes).where(eq(notes.id, noteId));
```

### Drizzle-Zod Integration
```typescript
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { notes } from '$lib/server/db/schema';

export const insertNoteSchema = createInsertSchema(notes, {
  title: (schema) => schema.title.min(1, 'Title required'),
});

export const selectNoteSchema = createSelectSchema(notes);
export type Note = typeof notes.$inferSelect;
export type NewNote = typeof notes.$inferInsert;
```

## Lucia v3 Authentication Patterns

### Lucia Setup
```typescript
// src/lib/server/auth.ts
import { Lucia } from 'lucia';
import { DrizzlePostgreSQLAdapter } from '@lucia-auth/adapter-drizzle';
import { db } from '$lib/server/db';
import { users, sessions } from '$lib/server/db/schema';

const adapter = new DrizzlePostgreSQLAdapter(db, sessions, users);

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      secure: import.meta.env.PROD,
    },
  },
  getUserAttributes: (attributes) => ({
    email: attributes.email,
  }),
});
```

### Session Handling in Hooks
```typescript
// src/hooks.server.ts
import { lucia } from '$lib/server/auth';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
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
      ...sessionCookie.attributes,
    });
  }

  if (!session) {
    const sessionCookie = lucia.createBlankSessionCookie();
    event.cookies.set(sessionCookie.name, sessionCookie.value, {
      path: '.',
      ...sessionCookie.attributes,
    });
  }

  event.locals.user = user;
  event.locals.session = session;
  return resolve(event);
};
```

### Protected Routes
```typescript
// src/routes/(protected)/+layout.server.ts
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
  if (!locals.user) {
    throw redirect(302, '/login');
  }
  return { user: locals.user };
};
```

## TanStack Query Patterns

### Query Client Setup
```typescript
// src/routes/+layout.svelte
<script lang="ts">
  import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false,
      },
    },
  });
</script>

<QueryClientProvider client={queryClient}>
  <slot />
</QueryClientProvider>
```

### Creating Queries
```typescript
// src/lib/queries/notes.ts
import { createQuery, createMutation, useQueryClient } from '@tanstack/svelte-query';

export function useNotes() {
  return createQuery({
    queryKey: ['notes'],
    queryFn: async () => {
      const res = await fetch('/api/notes');
      if (!res.ok) throw new Error('Failed to fetch notes');
      return res.json();
    },
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();

  return createMutation({
    mutationFn: async (data: { title: string; content: string }) => {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create note');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });
}
```

### Using Queries in Components
```svelte
<script lang="ts">
  import { useNotes, useCreateNote } from '$lib/queries/notes';

  const notes = useNotes();
  const createNote = useCreateNote();
</script>

{#if $notes.isPending}
  <p>Loading...</p>
{:else if $notes.error}
  <p>Error: {$notes.error.message}</p>
{:else}
  {#each $notes.data as note}
    <div>{note.title}</div>
  {/each}
{/if}
```

## State Management

### Local State
- Component state → `$state()` rune
- Derived values → `$derived()` rune

### Shared State
- Cross-component state → Svelte stores
- Server data → TanStack Query for caching
- User session → Lucia via SvelteKit hooks

## Form Validation with Zod

### Schema Definition
```typescript
import { z } from 'zod';

export const noteSchema = z.object({
  title: z.string().min(1, 'Title required'),
  content: z.string(),
  tags: z.array(z.string()),
});
```

### Form Integration
- Use superforms for SvelteKit form integration
- Validate on both client and server
- Display field-level errors

## Error Handling

### Server Errors
- Use `error()` from `@sveltejs/kit` for HTTP errors
- Return proper status codes (400, 401, 404, 500)
- Log detailed errors server-side

### Client Errors
- Display user-friendly error messages
- Use toast notifications for transient errors
- Provide recovery actions when possible

## Date Handling with date-fns

- Use `format()` for display formatting
- Use `parseISO()` for parsing ISO strings
- Use `isValid()` to validate dates
- Store dates as ISO strings in database

## Tauri Integration

### Desktop Features
- Use Tauri commands for native functionality
- Access file system through Tauri APIs
- System tray and native menus in Rust

### Platform Detection
```typescript
import { platform } from '@tauri-apps/plugin-os';
const isDesktop = typeof window !== 'undefined' && '__TAURI__' in window;
```

## Icon Usage with Lucide

```svelte
<script>
  import { FileText, Tag, Calendar } from 'lucide-svelte';
</script>

<FileText class="h-4 w-4" />
```

## Async Patterns

- Prefer async/await over raw promises
- Use loading states in UI during async operations
- Handle cancellation with AbortController when appropriate
- Debounce rapid user inputs (search, typing)
