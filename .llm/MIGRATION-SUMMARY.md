# LLM Documentation Migration Summary

This document summarizes the LLM documentation for the Olite application.

## Technology Stack

- **Framework**: SvelteKit 2 + Svelte 5 (with runes)
- **Database**: Neon (serverless PostgreSQL)
- **ORM**: Drizzle ORM with neonHttpAdapter
- **Authentication**: Lucia v3 (session-based)
- **Data Fetching**: TanStack Query (@tanstack/svelte-query)
- **Styling**: Tailwind CSS + shadcn-svelte
- **Icons**: Lucide Svelte
- **Validation**: Zod + drizzle-zod + sveltekit-superforms
- **Dates**: date-fns
- **Testing**: Vitest + Playwright + MSW
- **Hosting**: Cloudflare Pages
- **Storage**: Cloudflare R2
- **Images**: Cloudflare CDN-CGI/Image + vite-imagetools
- **Email**: Amazon SES
- **Analytics**: Cloudflare Analytics (later Highlight.io)
- **Desktop**: Tauri 2
- **Mobile**: Capacitor

## Files Overview

### Context Files (`.llm/context/`)
- **olite-overview.md** - Comprehensive overview of Olite's vision and features
- **technology-stack.md** - Full stack: SvelteKit/Neon/Drizzle/Lucia/Cloudflare
- **project-structure.md** - SvelteKit app structure with Drizzle and TanStack Query
- **coding-patterns.md** - Svelte 5 runes, Drizzle, Lucia, TanStack Query patterns
- **testing-strategy.md** - Vitest + Playwright + MSW testing
- **development-commands.md** - pnpm scripts for dev, build, test, db

### Rules Files (`.llm/rules/`)
- **javascript.md** - TypeScript/Svelte/Drizzle/Lucia/TanStack standards
- **architecture.md** - SvelteKit + Drizzle + Lucia + Cloudflare architecture patterns
- **testing.md** - Testing standards with MSW
- **documentation.md** - Documentation guidelines

### Agents (`.llm/agents/`)
- **application-architect.md** - Architecture planning
- **feature-implementer.md** - Feature development
- **test-writer-javascript.md** - Test writing
- **code-quality-enforcer.md** - Linting and quality
- **code-documentation-writer.md** - Documentation

### Root Context
- **root-context.md** - Main entry point
- **CLAUDE.md** - Symlink for Claude Code
- **AGENTS.md** - Symlink for GitHub Copilot

## Key Architecture Patterns

### SvelteKit Patterns
- File-based routing in `src/routes/`
- Server-side data loading in `+page.server.ts`
- Form actions for mutations
- API routes in `+server.ts`

### Svelte 5 Patterns
- `$state()` for reactive state
- `$derived()` for computed values
- `$effect()` for side effects
- `$props()` for component props

### Drizzle ORM Patterns
- Schema defined in `src/lib/server/db/schema.ts`
- Database client in `src/lib/server/db/index.ts`
- neonHttpAdapter for serverless connections
- drizzle-zod for Zod schema generation

### Lucia v3 Authentication
- Session handling in `hooks.server.ts`
- User/session stored in `event.locals`
- Protected routes with route groups `(protected)/`

### TanStack Query Patterns
- Query hooks in `src/lib/queries/`
- QueryClient configured in root layout
- Mutations with cache invalidation

### Testing Patterns
- Vitest for unit and component tests
- MSW for API mocking
- Playwright for E2E tests
- All tests run locally (no CI/CD)

## Development Workflow

- All development on `staging` branch
- Run tests locally before pushing
- Cloudflare Pages preview on staging push
- Merge to `main` when preview looks good
- No CI/CD - developer responsibility

## Cross-Platform Support

### Tauri (Desktop)
- Native desktop apps for macOS, Windows, Linux
- Rust source in `src-tauri/`
- Local file system access
- System tray and native menus

### Capacitor (Mobile)
- iOS and Android apps
- Native device features
- Same SvelteKit codebase
