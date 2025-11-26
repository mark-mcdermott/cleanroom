# Development Commands

## Setup & Install

```bash
pnpm install              # Install all dependencies
```

## Development

```bash
pnpm dev                  # Start SvelteKit dev server with HMR
pnpm tauri dev            # Start Tauri desktop app in development mode
```

## Lint & Format

```bash
pnpm lint                 # Run ESLint
pnpm lint:fix             # Auto-fix ESLint issues
pnpm format               # Run Prettier
pnpm check                # Run svelte-check (TypeScript + Svelte)
```

## Testing

```bash
pnpm test                 # Run all tests
pnpm test:unit            # Run Vitest unit tests
pnpm test:unit:watch      # Run unit tests in watch mode
pnpm test:e2e             # Run Playwright E2E tests
pnpm test:e2e:debug       # Run E2E tests with Playwright inspector
pnpm test:coverage        # Generate coverage report
```

## Build & Package

```bash
pnpm build                # Build SvelteKit for production
pnpm preview              # Preview production build locally
pnpm tauri build          # Create desktop app bundles (macOS, Windows, Linux)
```

## Database (Drizzle + Neon)

```bash
pnpm db:generate          # Generate Drizzle migrations from schema changes
pnpm db:migrate           # Run pending migrations on Neon
pnpm db:push              # Push schema changes directly (dev only)
pnpm db:studio            # Open Drizzle Studio (database GUI)
```

## Capacitor (Mobile)

```bash
pnpm cap add ios          # Add iOS platform
pnpm cap add android      # Add Android platform
pnpm cap sync             # Sync web build to native projects
pnpm cap open ios         # Open iOS project in Xcode
pnpm cap open android     # Open Android project in Android Studio
```

## Clean

```bash
rm -rf .svelte-kit        # Clear SvelteKit cache
rm -rf node_modules       # Full clean (requires reinstall)
```

## Environment Variables

- `.env` - Shared environment variables
- `.env.local` - Local overrides (gitignored)
- `DATABASE_URL` - Neon PostgreSQL connection string
- `CLOUDFLARE_ACCOUNT_ID` - Cloudflare account for R2
- `R2_ACCESS_KEY_ID` - R2 access credentials
- `R2_SECRET_ACCESS_KEY` - R2 secret key

## Git Workflow

Development workflow with no CI/CD:

```bash
# 1. Work on staging branch
git checkout staging

# 2. Make changes and run tests locally
pnpm test
pnpm lint
pnpm check

# 3. Commit and push to staging
git add .
git commit -m "feat: description"
git push origin staging
# → Triggers Cloudflare Pages preview deployment

# 4. Review preview deployment
# → Check https://staging.olite.pages.dev (or similar preview URL)

# 5. When preview looks good, merge to main
git checkout main
git merge staging
git push origin main
# → Triggers Cloudflare Pages production deployment

# 6. Return to staging for next changes
git checkout staging
```

## Pre-Push Checklist

Before pushing to `staging`:

```bash
pnpm lint                 # No ESLint errors
pnpm check                # No TypeScript/Svelte errors
pnpm test                 # All tests pass
pnpm build                # Build succeeds
```
