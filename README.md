# Cleanroom

A scaffolding tool for SvelteKit projects. Generate production-ready sites with authentication, UI components, and Cloudflare Pages deployment—all from the command line.

## Quick Start

```bash
npx cleanroom
```

The CLI will guide you through:

1. **Project name** - Name your project
2. **Logo** - Use an image file or emoji
3. **Site type** - Choose from:
   - Simple demo page (single page, no nav)
   - Simple landing page (single page, responsive)
   - Landing page with scroll sections (section nav & mobile menu)
   - Simple static site (multiple pages with nav)
4. **GitHub** - Automatically creates a repo and pushes code
5. **Cloudflare Pages** - Guides you through deployment setup
6. **Custom domain** - Optional Namecheap domain configuration

Your project will be generated in `./generated/<project-name>/`.

## Requirements

- Node.js 22+
- pnpm
- GitHub CLI (`gh`) - installed automatically if missing
- GitHub account
- Cloudflare account (free tier works)

---

## Development

This section is for contributors working on Cleanroom itself.

### Setup

```bash
# Clone the repo
git clone https://github.com/mark-mcdermott/cleanroom.git
cd cleanroom

# Install dependencies
pnpm install

# Create .dev.vars for local database access
echo 'DATABASE_URL="your-neon-connection-string"' > .dev.vars

# Run database migrations
pnpm db:push
```

### Development Commands

```bash
# Start dev server
pnpm dev

# Run the CLI locally
pnpm cli

# Type checking
pnpm check

# Linting
pnpm lint
pnpm lint:fix

# Format code
pnpm format

# Run all tests
pnpm test

# Run unit tests only
pnpm test:unit
pnpm test:unit:watch

# Run E2E tests only
pnpm test:e2e
pnpm test:e2e:debug

# Build for production
pnpm build

# Preview production build
pnpm preview
```

### Database Commands

```bash
# Generate migrations from schema changes
pnpm db:generate

# Apply migrations
pnpm db:migrate

# Push schema directly (dev only)
pnpm db:push

# Open Drizzle Studio
pnpm db:studio
```

### Project Structure

```
src/
├── cli/                 # CLI tool (scaffolding generator)
│   ├── index.ts         # Main CLI entry point
│   ├── modules/         # Site type generators
│   └── templates/       # Template files for generated projects
├── lib/
│   ├── components/
│   │   ├── ui/          # Base UI components (Button, Card, Input, etc.)
│   │   └── blocks/      # Composed components (AuthNav, SimpleHero, etc.)
│   └── server/          # Server-side code (auth, db, password)
├── routes/              # SvelteKit routes
│   ├── (auth)/          # Auth pages (login, signup, logout)
│   ├── account/         # User settings page
│   ├── blocks/          # Blocks component gallery
│   ├── components/      # UI component gallery
│   └── u/[id]/          # User profile page
└── hooks.server.ts      # Server hooks (auth middleware)
```

### Tech Stack

- **Framework**: SvelteKit with Svelte 5
- **Styling**: Tailwind CSS v4
- **UI Components**: bits-ui primitives
- **Database**: Neon PostgreSQL with Drizzle ORM
- **Auth**: Lucia Auth
- **Deployment**: Cloudflare Pages
- **Testing**: Vitest (unit) + Playwright (E2E)

### Environment Variables

For local development, create a `.dev.vars` file:

```
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
```

For Cloudflare Pages, set `DATABASE_URL` as a secret in the dashboard.

### Contributing

1. Create a feature branch from `staging`
2. Make your changes
3. Run `pnpm check && pnpm test`
4. Submit a PR to `staging`
