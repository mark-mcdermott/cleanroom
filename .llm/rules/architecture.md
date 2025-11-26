---
description: Design patterns, principles, and function quality standards for building maintainable code
alwaysApply: false
---
# Architecture Guidelines

## Purpose
Defines architectural patterns, design principles, and structural decisions for building maintainable, testable code in Olite.

## Core Principles
- **MUST** rules are enforced by linting/CI; **SHOULD** rules are strongly recommended.
- Terms "function" and "method" are used interchangeably.

## Design Patterns

### Module Organization
- **ARCH.MOD-1 (SHOULD)**: Organize code by feature/domain, not by type
- **ARCH.MOD-2 (SHOULD)**: Keep related functionality together (colocation)
- **ARCH.MOD-3 (SHOULD)**: Use clear boundaries between client, server, and shared code

### Utility Functions
- **ARCH.UTIL-1 (SHOULD)**: Extract pure functions for reusable logic
- **ARCH.UTIL-2 (SHOULD)**: Keep utilities stateless and deterministic
- **ARCH.UTIL-3 (SHOULD)**: Place utilities in `src/lib/utils/`

### Svelte Stores
- **ARCH.STORE-1 (SHOULD)**: Use stores for shared state across components
- **ARCH.STORE-2 (SHOULD)**: Keep stores focused on single responsibility
- **ARCH.STORE-3 (SHOULD)**: Place stores in `src/lib/stores/`

### Error Handling
- **ARCH.ERR-1 (SHOULD)**: Use SvelteKit `error()` for HTTP errors
- **ARCH.ERR-2 (MUST)**: Handle all async errors with try/catch
- **ARCH.ERR-3 (SHOULD)**: Display user-friendly error messages in UI

## Design Principles

### Single Responsibility
- **ARCH.SRP-1 (SHOULD)**: Functions and modules should have one clear purpose
- **ARCH.SRP-2 (SHOULD)**: Components should do one thing well

### Separation of Concerns
- **ARCH.SOC-1 (MUST)**: Keep business logic out of UI components
- **ARCH.SOC-2 (MUST)**: Handle data fetching in load functions, not components
- **ARCH.SOC-3 (SHOULD)**: Separate validation schemas from business logic

### Composition Over Inheritance
- **ARCH.COMP-1 (SHOULD)**: Use stores and functions for shared behavior
- **ARCH.COMP-2 (SHOULD NOT)**: Use class inheritance for code reuse
- **ARCH.COMP-3 (SHOULD)**: Compose small functions to build complex behavior

### Immutability
- **ARCH.IMMUT-1 (SHOULD)**: Prefer immutable data structures
- **ARCH.IMMUT-2 (SHOULD)**: Use spread operators or methods like `map()` instead of mutation

### Pattern Consistency
- **ARCH.PATTERN-1 (SHOULD)**: Follow existing patterns in the codebase before creating new ones
- **ARCH.PATTERN-2 (SHOULD)**: Use consistent naming conventions throughout

## Code Organization

### Naming and Vocabulary
- **ARCH.NAME-1 (MUST)**: Use clear, descriptive names that match domain vocabulary
- **ARCH.NAME-2 (SHOULD)**: Avoid abbreviations unless widely understood
- **ARCH.NAME-3 (SHOULD)**: Use verb-noun pairs for function names (`parseMarkdown`, `extractTags`)

### Function Design
- **ARCH.FUNC-1 (SHOULD)**: Prefer small, composable, testable functions
- **ARCH.FUNC-2 (SHOULD)**: Keep functions under 50 lines when possible
- **ARCH.FUNC-3 (SHOULD NOT)**: Extract a new function unless:
  - It will be reused elsewhere
  - It's the only way to unit-test otherwise untestable logic
  - It drastically improves readability

### Comments and Documentation
- **ARCH.DOC-1 (SHOULD NOT)**: Add comments except for critical caveats or complex algorithms
- **ARCH.DOC-2 (SHOULD)**: Rely on self-explanatory code with good naming
- **ARCH.DOC-3 (SHOULD)**: Document complex Zod schemas with JSDoc

## Function Quality Checklist

When evaluating function quality, check:

1. **ARCH.Q-1 (SHOULD)**: Ensure functions are readable and easy to follow
2. **ARCH.Q-2 (SHOULD)**: Avoid high cyclomatic complexity (excessive branching)
3. **ARCH.Q-3 (SHOULD)**: Use appropriate data structures to improve clarity
4. **ARCH.Q-4 (MUST NOT)**: Include unused parameters in function signatures
5. **ARCH.Q-5 (SHOULD NOT)**: Hide dependencies; pass them as arguments
6. **ARCH.Q-6 (MUST)**: Use descriptive function names consistent with domain vocabulary

## SvelteKit-Specific Architecture

### Server vs Client
- **ARCH.SERVER-1 (MUST)**: Use `+page.server.ts` for database operations
- **ARCH.SERVER-2 (MUST)**: Use `+server.ts` for API endpoints
- **ARCH.SERVER-3 (MUST NOT)**: Import server-only code in client components

### Data Flow
- **ARCH.DATA-1 (MUST)**: Load data in load functions, not in components
- **ARCH.DATA-2 (SHOULD)**: Pass data to components via props
- **ARCH.DATA-3 (SHOULD)**: Use form actions for mutations

### Route Organization
- **ARCH.ROUTE-1 (SHOULD)**: Group related routes in folders
- **ARCH.ROUTE-2 (SHOULD)**: Use layouts for shared UI
- **ARCH.ROUTE-3 (SHOULD)**: Use route groups for organization without URL segments

## Drizzle ORM Architecture

### Schema Design
- **ARCH.DRIZZLE-1 (MUST)**: Define all tables in `src/lib/server/db/schema.ts`
- **ARCH.DRIZZLE-2 (SHOULD)**: Use snake_case for database column names
- **ARCH.DRIZZLE-3 (SHOULD)**: Use camelCase for TypeScript property names
- **ARCH.DRIZZLE-4 (MUST)**: Define foreign key relationships in schema

### Database Client
- **ARCH.DRIZZLE-5 (MUST)**: Use neonHttpAdapter for serverless connections
- **ARCH.DRIZZLE-6 (MUST)**: Export db client from `src/lib/server/db/index.ts`
- **ARCH.DRIZZLE-7 (SHOULD)**: Use Drizzle's query builder for type-safe queries

### Migrations
- **ARCH.DRIZZLE-8 (MUST)**: Generate migrations with `pnpm db:generate`
- **ARCH.DRIZZLE-9 (MUST)**: Review generated SQL before applying
- **ARCH.DRIZZLE-10 (SHOULD)**: Use `pnpm db:push` only in development

## Lucia Authentication Architecture

### Session Management
- **ARCH.LUCIA-1 (MUST)**: Configure Lucia in `src/lib/server/auth.ts`
- **ARCH.LUCIA-2 (MUST)**: Handle sessions in `hooks.server.ts`
- **ARCH.LUCIA-3 (MUST)**: Store user/session in `event.locals`

### Protected Routes
- **ARCH.LUCIA-4 (SHOULD)**: Use route groups for protected pages `(protected)/`
- **ARCH.LUCIA-5 (MUST)**: Check `locals.user` in layout load functions
- **ARCH.LUCIA-6 (MUST)**: Redirect unauthenticated users to login

## TanStack Query Architecture

### Query Organization
- **ARCH.QUERY-1 (SHOULD)**: Place query hooks in `src/lib/queries/`
- **ARCH.QUERY-2 (SHOULD)**: Name hooks with `use` prefix (`useNotes`, `useCreateNote`)
- **ARCH.QUERY-3 (MUST)**: Configure QueryClient in root layout

### Caching Strategy
- **ARCH.QUERY-4 (SHOULD)**: Set appropriate staleTime for data freshness
- **ARCH.QUERY-5 (SHOULD)**: Invalidate queries after mutations
- **ARCH.QUERY-6 (SHOULD)**: Use optimistic updates for better UX

## Cloudflare Architecture

### R2 Storage
- **ARCH.R2-1 (MUST)**: Use R2 for user-uploaded files
- **ARCH.R2-2 (SHOULD)**: Generate signed URLs for private files
- **ARCH.R2-3 (SHOULD)**: Use CDN-CGI/Image for image transformations

### Deployment
- **ARCH.CF-1 (MUST)**: Deploy to Cloudflare Pages
- **ARCH.CF-2 (MUST)**: Use `staging` branch for preview deployments
- **ARCH.CF-3 (MUST)**: Use `main` branch for production

## Validation Architecture

### Zod Schemas
- **ARCH.ZOD-1 (MUST)**: Define schemas for all user input
- **ARCH.ZOD-2 (MUST)**: Validate on both client and server
- **ARCH.ZOD-3 (SHOULD)**: Use drizzle-zod to generate schemas from tables
- **ARCH.ZOD-4 (SHOULD)**: Reuse schemas between form validation and API validation

## Testability

### Test Design
- **ARCH.TEST-1 (SHOULD)**: Design functions to be easily testable
- **ARCH.TEST-2 (SHOULD)**: Use MSW for mocking HTTP requests
- **ARCH.TEST-3 (SHOULD)**: Mock Drizzle in isolated unit tests
- **ARCH.TEST-4 (SHOULD)**: Use E2E tests for integration scenarios

## Performance Considerations

- **ARCH.PERF-1 (SHOULD)**: Avoid premature optimization
- **ARCH.PERF-2 (SHOULD)**: Profile before optimizing
- **ARCH.PERF-3 (SHOULD)**: Use streaming for large data sets
- **ARCH.PERF-4 (SHOULD)**: Implement pagination for lists

## Platform-Specific Architecture

### Tauri (Desktop)
- **ARCH.TAURI-1 (SHOULD)**: Use Tauri commands for native features
- **ARCH.TAURI-2 (MUST)**: Check for Tauri environment before using APIs
- **ARCH.TAURI-3 (SHOULD)**: Implement offline support for desktop

### Capacitor (Mobile)
- **ARCH.CAP-1 (SHOULD)**: Use Capacitor plugins for native features
- **ARCH.CAP-2 (MUST)**: Check for Capacitor environment before using APIs
- **ARCH.CAP-3 (SHOULD)**: Handle mobile-specific UI considerations
