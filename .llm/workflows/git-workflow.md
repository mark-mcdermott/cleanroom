# Git & Branching Workflow

## Branching Strategy

- **`staging`** - Primary development branch
- **`main`** - Production branch (protected)
- Feature branches optional: `feat/description` from `staging`

## Development Workflow

### Daily Development

1. **Work on `staging` branch**
   ```bash
   git checkout staging
   git pull origin staging
   ```

2. **Make changes and test locally**
   ```bash
   # Run all checks before committing
   pnpm lint
   pnpm check
   pnpm test
   pnpm build
   ```

3. **Commit with conventional commits**
   ```bash
   git add .
   git commit -m "feat: add note creation form"
   ```

4. **Push to staging**
   ```bash
   git push origin staging
   ```
   → Triggers Cloudflare Pages preview deployment

5. **Review preview deployment**
   - Check the Cloudflare Pages preview URL
   - Verify changes work as expected
   - Test on different browsers/devices if needed

### Production Deployment

When preview looks good:

```bash
# 1. Switch to main
git checkout main
git pull origin main

# 2. Merge staging
git merge staging

# 3. Push to production
git push origin main
# → Triggers Cloudflare Pages production deployment

# 4. Return to staging for next work
git checkout staging
```

## Commits

### Conventional Commits Format
- `feat:` - New feature
- `fix:` - Bug fix
- `chore:` - Maintenance tasks
- `test:` - Test additions/changes
- `docs:` - Documentation changes
- `refactor:` - Code refactoring
- `style:` - Formatting changes

### Commit Message Guidelines
- Write clear messages explaining *why* not just *what*
- Keep subject line under 50 characters
- Use present tense ("add feature" not "added feature")
- Do not include AI authorship metadata in commits

### Examples
```bash
git commit -m "feat: add tag extraction from markdown content"
git commit -m "fix: resolve session cookie not persisting on refresh"
git commit -m "refactor: extract note parsing into utility function"
git commit -m "test: add MSW handlers for notes API"
```

## Pre-Push Checklist

Before every push to `staging`:

```bash
pnpm lint        # ESLint passes
pnpm check       # TypeScript/Svelte check passes
pnpm test        # All tests pass
pnpm build       # Build succeeds
```

**No CI/CD** - These checks are your responsibility locally.

## Pull Requests (Optional)

For larger features, you may use feature branches:

```bash
# Create feature branch
git checkout -b feat/user-authentication staging

# Work on feature...

# Push and create PR targeting staging
git push -u origin feat/user-authentication
```

### PR Guidelines
- Target `staging` branch (not `main`)
- Include description of changes
- Note any testing done
- Self-review before merging

## Branch Protection

- **`main`** is protected - only merge from `staging`
- Never force push to `main`
- All production changes flow through `staging` first

## Hotfixes

For urgent production fixes:

```bash
# 1. Create hotfix from main
git checkout -b hotfix/critical-bug main

# 2. Make fix and test locally
pnpm test

# 3. Merge to main
git checkout main
git merge hotfix/critical-bug
git push origin main

# 4. Backport to staging
git checkout staging
git merge main
git push origin staging

# 5. Clean up
git branch -d hotfix/critical-bug
```

## No CI/CD Policy

This project intentionally has no CI/CD pipeline:

- **Developer responsibility**: Run all checks locally before pushing
- **Preview deployments**: Cloudflare Pages automatically deploys `staging` pushes
- **Production deployments**: Cloudflare Pages automatically deploys `main` pushes
- **Quality gate**: Your local `pnpm test && pnpm lint && pnpm check && pnpm build`

This approach keeps the workflow simple and gives developers full control over what gets deployed.
