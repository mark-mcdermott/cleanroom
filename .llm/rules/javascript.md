---
description: JavaScript/TypeScript and Svelte coding standards for SvelteKit apps
alwaysApply: false
---
# JavaScript and TypeScript Guidelines

## Purpose
Defines JavaScript/TypeScript coding standards, Svelte 5 patterns, and SvelteKit best practices for Olite.

## Application Context

Olite is a SvelteKit application using:
- TypeScript with strict mode
- Svelte 5 with runes
- SvelteKit 2 for routing and server-side
- Neon PostgreSQL with Drizzle ORM
- Lucia v3 for authentication
- TanStack Query for client-side data fetching
- Tauri for desktop, Capacitor for mobile

## TypeScript Standards

### Type Safety
- **JS.TS-1 (MUST)**: Enable strict mode in `tsconfig.json`
- **JS.TS-2 (MUST)**: Define types for Drizzle database schema
- **JS.TS-3 (SHOULD)**: Use explicit return types for functions
- **JS.TS-4 (SHOULD)**: Avoid `any` type; use `unknown` when type is truly unknown
- **JS.TS-5 (MUST)**: Define types for all component props using `$props()`

### Variable Declaration
- **JS.VAR-1 (MUST)**: Use `const` by default; use `let` only when reassignment needed
- **JS.VAR-2 (MUST NOT)**: Use `var`

## Svelte 5 Patterns

### Runes
- **JS.RUNE-1 (MUST)**: Use `$state()` for reactive state
- **JS.RUNE-2 (MUST)**: Use `$derived()` for computed values
- **JS.RUNE-3 (MUST)**: Use `$effect()` for side effects
- **JS.RUNE-4 (MUST)**: Use `$props()` for component props
- **JS.RUNE-5 (SHOULD)**: Keep effects minimal and focused

### Component Structure
- **JS.SVELTE-1 (SHOULD)**: Keep components small and focused (< 200 lines)
- **JS.SVELTE-2 (SHOULD)**: Extract complex logic into utility functions
- **JS.SVELTE-3 (SHOULD)**: Use snippets for reusable template fragments
- **JS.SVELTE-4 (MUST)**: Use TypeScript in `<script lang="ts">`

### Reactivity
- **JS.REACT-1 (SHOULD)**: Prefer `$derived()` over manual state updates
- **JS.REACT-2 (SHOULD)**: Use stores for shared state across components
- **JS.REACT-3 (SHOULD NOT)**: Mutate state directly; use runes

## SvelteKit Patterns

### Data Loading
- **JS.LOAD-1 (MUST)**: Use `+page.server.ts` for server-side data loading
- **JS.LOAD-2 (MUST)**: Return typed data from load functions
- **JS.LOAD-3 (SHOULD)**: Handle errors with `error()` helper
- **JS.LOAD-4 (MUST)**: Use Drizzle queries in server load functions

### Form Handling
- **JS.FORM-1 (SHOULD)**: Use SvelteKit form actions for mutations
- **JS.FORM-2 (SHOULD)**: Use superforms with Zod for validation
- **JS.FORM-3 (SHOULD)**: Implement progressive enhancement

### API Routes
- **JS.API-1 (MUST)**: Use `+server.ts` for REST API endpoints
- **JS.API-2 (MUST)**: Return proper HTTP status codes
- **JS.API-3 (MUST)**: Validate inputs with Zod schemas

## Drizzle ORM Patterns

### Database Queries
- **JS.DRIZZLE-1 (MUST)**: Use Drizzle in server-side code only
- **JS.DRIZZLE-2 (MUST)**: Use type-safe query builder
- **JS.DRIZZLE-3 (MUST)**: Handle all database errors
- **JS.DRIZZLE-4 (SHOULD)**: Use `.returning()` for insert/update operations

### Schema Types
- **JS.DRIZZLE-5 (SHOULD)**: Use `$inferSelect` for select types
- **JS.DRIZZLE-6 (SHOULD)**: Use `$inferInsert` for insert types
- **JS.DRIZZLE-7 (SHOULD)**: Use drizzle-zod for validation schemas

## Lucia v3 Authentication Patterns

### Session Handling
- **JS.LUCIA-1 (MUST)**: Validate sessions in `hooks.server.ts`
- **JS.LUCIA-2 (MUST)**: Store user/session in `event.locals`
- **JS.LUCIA-3 (MUST)**: Refresh session cookies when fresh

### Protected Routes
- **JS.LUCIA-4 (MUST)**: Check `locals.user` before protected operations
- **JS.LUCIA-5 (SHOULD)**: Redirect to login when unauthenticated
- **JS.LUCIA-6 (MUST)**: Invalidate session on logout

## TanStack Query Patterns

### Query Hooks
- **JS.QUERY-1 (SHOULD)**: Create custom hooks for queries (`useNotes`, etc.)
- **JS.QUERY-2 (MUST)**: Define queryKey for cache management
- **JS.QUERY-3 (SHOULD)**: Handle loading/error states in components

### Mutations
- **JS.QUERY-4 (SHOULD)**: Use `createMutation` for data changes
- **JS.QUERY-5 (MUST)**: Invalidate related queries after mutations
- **JS.QUERY-6 (SHOULD)**: Use optimistic updates for better UX

## File Organization

See @.llm/context/project-structure.md for directory structure.

### File Naming
- **JS.NAME-1 (MUST)**: Use PascalCase for component files (`NoteEditor.svelte`)
- **JS.NAME-2 (MUST)**: Use camelCase for utility files (`parseMarkdown.ts`)
- **JS.NAME-3 (MUST)**: Use camelCase for store files (`noteStore.ts`)
- **JS.NAME-4 (MUST)**: Use camelCase for query files (`useNotes.ts`)
- **JS.NAME-5 (MUST)**: Use camelCase with Schema suffix for Zod schemas (`noteSchema.ts`)

### Directory Structure
- **JS.ORG-1 (MUST)**: Place Svelte components in `src/lib/components/`
- **JS.ORG-2 (MUST)**: Place shadcn-svelte components in `src/lib/components/ui/`
- **JS.ORG-3 (MUST)**: Place stores in `src/lib/stores/`
- **JS.ORG-4 (MUST)**: Place utilities in `src/lib/utils/`
- **JS.ORG-5 (MUST)**: Place Zod schemas in `src/lib/schemas/`
- **JS.ORG-6 (MUST)**: Place TanStack Query hooks in `src/lib/queries/`
- **JS.ORG-7 (MUST)**: Place Drizzle code in `src/lib/server/db/`

## Validation with Zod

### Schema Definition
- **JS.ZOD-1 (MUST)**: Define schemas for all form inputs
- **JS.ZOD-2 (MUST)**: Define schemas for all API request bodies
- **JS.ZOD-3 (SHOULD)**: Use `.transform()` for data normalization
- **JS.ZOD-4 (SHOULD)**: Export inferred types from schemas
- **JS.ZOD-5 (SHOULD)**: Use drizzle-zod for database-aligned schemas

## Date Handling with date-fns

- **JS.DATE-1 (SHOULD)**: Use `format()` for display formatting
- **JS.DATE-2 (SHOULD)**: Use `parseISO()` for parsing ISO strings
- **JS.DATE-3 (MUST)**: Store dates as ISO strings in database

## Icon Usage with Lucide

- **JS.ICON-1 (MUST)**: Import icons from `lucide-svelte`
- **JS.ICON-2 (SHOULD)**: Use consistent icon sizes via Tailwind classes

## Async Patterns

### Error Handling
- **JS.ASYNC-1 (MUST)**: Use try/catch for all async operations
- **JS.ASYNC-2 (SHOULD)**: Display user-friendly error messages in UI
- **JS.ASYNC-3 (MUST)**: Log detailed errors server-side
- **JS.ASYNC-4 (SHOULD)**: Use AbortController for cancellable operations

### Promises
- **JS.PROM-1 (SHOULD)**: Prefer async/await over raw promises
- **JS.PROM-2 (MUST NOT)**: Leave promises unhandled
- **JS.PROM-3 (SHOULD)**: Use Promise.all() for parallel operations

## Testing Standards

See @.llm/context/testing-strategy.md for test organization.
See @.llm/rules/testing.md for testing quality standards.

- **JS.TEST-1 (MUST)**: Write unit tests for utilities and schemas
- **JS.TEST-2 (SHOULD)**: Write component tests for Svelte components
- **JS.TEST-3 (MUST)**: Use MSW for mocking API requests in tests
- **JS.TEST-4 (SHOULD)**: Use Playwright for E2E testing

## Code Quality

### Linting
- **JS.LINT-1 (MUST)**: ESLint must pass with zero errors
- **JS.LINT-2 (MUST)**: Prettier must pass (consistent formatting)
- **JS.LINT-3 (MUST)**: svelte-check must pass with zero errors
- **JS.LINT-4 (SHOULD)**: Fix all ESLint warnings

### Code Style
- **JS.STYLE-1 (MUST)**: Use tabs for indentation (Svelte convention)
- **JS.STYLE-2 (SHOULD)**: Limit line length to 100 characters
- **JS.STYLE-3 (SHOULD)**: Use single quotes for strings

## Tauri Integration

### Desktop Features
- **JS.TAURI-1 (SHOULD)**: Use Tauri commands for native functionality
- **JS.TAURI-2 (MUST)**: Check for Tauri environment before using APIs
- **JS.TAURI-3 (SHOULD)**: Provide fallbacks for web-only deployment

## Performance

### Svelte Performance
- **JS.PERF-1 (SHOULD)**: Use `{#key}` blocks for forcing re-renders
- **JS.PERF-2 (SHOULD)**: Use `$derived()` for expensive computations
- **JS.PERF-3 (SHOULD NOT)**: Optimize prematurely; measure first

### Data Loading
- **JS.PERF-4 (SHOULD)**: Use streaming for large data sets
- **JS.PERF-5 (SHOULD)**: Implement pagination for lists
- **JS.PERF-6 (SHOULD)**: Use TanStack Query caching appropriately
