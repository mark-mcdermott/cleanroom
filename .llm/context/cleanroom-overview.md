# Cleanroom Project Overview

## What is Cleanroom?

Cleanroom is a scaffolding/starter app generator (like Yeoman) for SvelteKit projects. It uses @clack/prompts for interactive CLI questions to configure and scaffold projects based on user preferences.

The project runs on web (SvelteKit), desktop (via Tauri), and mobile (via Capacitor). It emphasizes modularity, clean code, and maintainability.

## Project Phases

### Phase 1: Foundation (Current Focus)
- Core scaffolding engine using @clack/prompts
- Component library with gallery pages
- Block library (composed components)
- Page library (pre-built pages using blocks)
- Base architecture and patterns

### Phase 2: Modules (Next)
Optional feature modules that can be scaffolded:
- Authentication (Lucia v3)
- SSR configuration
- Newsfeed
- Chat
- Microposts
- Blogging
- And more...

## Core Features

### 1. Interactive CLI Scaffolding
- @clack/prompts for beautiful terminal prompts
- Questions like "Do you need a mobile menu?", "Do you need SSR?"
- Conditional scaffolding based on answers
- Module selection and configuration

### 2. Library System

#### Component Library
- Reusable UI components built on shadcn-svelte
- Gallery pages for browsing components
- Consistent styling with Tailwind CSS

#### Block Library
- Composed components forming functional units
- Higher-level abstractions built from components
- Reusable across different page types

#### Page Library
- Pre-built pages using blocks
- Organized by module (blogging, microposts, etc.)
- Ready-to-use templates

### 3. Theme System
- **theme-forseen**: Color theme and Google Fonts browser (in development)
- Scroll through color themes to find one you like
- Browse and select Google Fonts
- Apply themes to scaffolded projects

## Related Codebases

- `./../cleanroom-v01` - Frontend layout/UI to retrofit here
- `./../../robo-korgi/cleanroom-proj/cleanroom` - Component library and gallery pages to retrofit here

## Technical Architecture

### SvelteKit Application
- **Routes** - SvelteKit file-based routing for pages and API
- **Components** - Svelte 5 with runes for reactive UI
- **Styling** - Tailwind CSS + shadcn-svelte components

### Backend (Neon + Drizzle)
- Neon serverless PostgreSQL database
- Drizzle ORM for type-safe database operations
- neonHttpAdapter for serverless-friendly connections
- drizzle-zod for generating Zod schemas from Drizzle tables

### Authentication (Lucia v3)
- Session-based authentication with Lucia v3
- Cookie-based sessions via SvelteKit hooks
- Secure password hashing and session management

### Data Fetching
- TanStack Query (@tanstack/svelte-query) for client-side caching
- Server-side data loading via SvelteKit load functions
- Optimistic updates and background refetching

### File Storage (Cloudflare R2)
- Cloudflare R2 for object storage
- Cloudflare CDN-CGI/Image for image transformations
- vite-imagetools for build-time image optimization

### Hosting (Cloudflare Pages)
- Cloudflare Pages for web deployment
- Preview deployments on staging branch pushes
- Production deployment on main branch

### Desktop (Tauri)
- Native desktop app for macOS, Windows, Linux
- Local file system access via Tauri APIs
- System tray and native menus

### Mobile (Capacitor)
- iOS and Android apps from same codebase
- Native device features (camera, storage)

### CLI (@clack/prompts)
- Beautiful terminal prompts
- Multi-select, confirm, text input
- Progress spinners and grouped options

## Design Philosophy

1. **Modularity**: Everything is optional and configurable
2. **Clean Code**: Maintainable, well-tested, easy to modify
3. **DRY**: Components, blocks, and pages are reusable
4. **Cross-Platform**: Single codebase for web, desktop, and mobile
5. **Developer Experience**: Fast scaffolding, clear patterns

## Development Environment

- All development runs in Docker
- All tests run locally (not in Docker)
- No CI/CD pipeline - developer responsibility
- Source control: GitHub

## Development Priorities

1. Core scaffolding engine with @clack/prompts
2. Component library and gallery
3. Block library
4. Page library
5. Module system (auth, SSR, etc.)
6. theme-forseen integration
7. Desktop and mobile apps
