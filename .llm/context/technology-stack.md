# Technology Stack

## Runtime Versions

- Node.js 22 (LTS)
- pnpm (package manager)
- TypeScript 5 (strict mode enabled)

## Web Framework

- SvelteKit 2 (full-stack web framework)
- Svelte 5 (UI framework with runes)
- Vite 5 (build tool and dev server)
- vite-imagetools (image optimization at build time)

## Desktop & Mobile

- Tauri 2 (desktop application - macOS, Windows, Linux)
- Capacitor (mobile application - iOS, Android)
- Shared SvelteKit codebase across all platforms

## Hosting & Deployment

- Cloudflare Pages (web hosting with preview deployments)
- Cloudflare R2 (object storage for files/images)
- Cloudflare CDN-CGI/Image (image transformation/optimization)
- Cloudflare Analytics (production analytics, later Highlight.io)
- GitHub (source control, no CI/CD - manual workflow)

## UI and Styling

- Tailwind CSS 3 (utility-first styling)
- shadcn-svelte (UI component library)
- Lucide Svelte (icon library)
- theme-forseen (color theme and Google Fonts browser - in development)

## Backend & Data

- Neon (serverless PostgreSQL database)
- neonHttpAdapter (Drizzle adapter for Neon's HTTP API)
- Drizzle ORM (TypeScript-first ORM)
- drizzle-zod (Zod schema generation from Drizzle schemas)

## Authentication

- Lucia v3 (session-based authentication library)
- Cookie-based sessions with SvelteKit hooks

## Data Fetching

- TanStack Query (@tanstack/svelte-query) for client-side data fetching
- Server-side data loading via SvelteKit load functions

## Validation & Utilities

- Zod (schema validation)
- drizzle-zod (generate Zod schemas from Drizzle tables)
- date-fns (date manipulation)
- sveltekit-superforms (form handling with Zod integration)

## CLI

- @clack/prompts (beautiful terminal prompts for scaffolding)

## Testing & Quality

- Vitest (unit and component tests)
- Playwright (E2E testing)
- MSW (Mock Service Worker for API mocking in tests)
- ESLint + Prettier (with Svelte plugins)
- TypeScript strict mode
- All tests run locally (not in Docker)

## Email

- Amazon SES (transactional email)

## Development Workflow

- All development runs in Docker
- All tests run locally (not in Docker)
- No CI/CD - manual workflow
- All development on `staging` branch
- Run tests locally before pushing to `staging`
- Staging pushes trigger Cloudflare Pages preview deployments
- Merge and push to `main` when preview looks good
- Hot Module Replacement (HMR) via Vite
- SvelteKit dev server with SSR
