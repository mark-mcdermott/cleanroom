# Testing Strategy

## File Organization

- **Unit Tests:** `tests/unit/**/*.test.ts` or co-located `src/**/*.test.ts` (Vitest)
- **E2E Tests:** `tests/e2e/**/*.spec.ts` (Playwright)

## Vitest Configuration

### vitest.config.ts

Create `vitest.config.ts` in project root:

```typescript
import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
  plugins: [sveltekit()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['src/**/*.test.ts', 'tests/unit/**/*.test.ts'],
    exclude: ['tests/e2e/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'tests/', '**/*.d.ts', '**/*.config.*'],
    },
    alias: {
      $lib: '/src/lib',
      '$lib/*': '/src/lib/*',
    },
  },
});
```

### Required Dependencies

Add to package.json devDependencies:

```json
{
  "devDependencies": {
    "vitest": "^2.0.0",
    "@vitest/ui": "^2.0.0",
    "@vitest/coverage-v8": "^2.0.0",
    "@testing-library/svelte": "^5.0.0",
    "@testing-library/dom": "^10.0.0",
    "@testing-library/user-event": "^14.0.0",
    "jsdom": "^25.0.0",
    "msw": "^2.0.0"
  }
}
```

### Test Scripts in package.json

```json
{
  "scripts": {
    "test": "pnpm test:unit && pnpm test:e2e",
    "test:unit": "vitest run",
    "test:unit:watch": "vitest",
    "test:unit:ui": "vitest --ui",
    "test:e2e": "playwright test",
    "test:e2e:debug": "playwright test --debug",
    "test:coverage": "vitest run --coverage"
  }
}
```

## Test Types

| Type        | Tools                    | Purpose                                    |
| ----------- | ------------------------ | ------------------------------------------ |
| Unit        | Vitest                   | Pure functions, utilities, Zod schemas     |
| Component   | Vitest + Testing Library | Svelte component behavior                  |
| E2E         | Playwright               | Full user flows (web + Tauri desktop)      |

## What to Test

### Unit Tests
- Utility functions (`$lib/utils/`)
- Zod schema validation (`$lib/schemas/`)
- Store logic (`$lib/stores/`)
- Data transformations
- Date formatting with date-fns
- Drizzle query builders (mocked)

### Component Tests
- Component rendering with different props
- User interactions (clicks, form inputs)
- Conditional rendering logic
- Slot content rendering
- TanStack Query integration (with MSW)

### E2E Tests
- Authentication flows
- Form submissions
- Navigation between pages
- Data persistence with Neon
- Desktop-specific features (Tauri)

## SvelteKit-Specific Testing

### Load Functions
- Test `+page.server.ts` load functions
- Mock database with MSW or test utilities
- Verify returned data structure

### Form Actions
- Test form action handlers
- Verify validation errors
- Check database mutations

### API Routes
- Test `+server.ts` endpoints
- Verify response status codes
- Check authentication requirements

## MSW (Mock Service Worker) Testing

### Setup MSW for Tests
```typescript
// tests/setup.ts
import { setupServer } from 'msw/node';
import { handlers } from './mocks/handlers';

export const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### Define Mock Handlers
```typescript
// tests/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/notes', () => {
    return HttpResponse.json([
      { id: '1', title: 'Test Note', content: 'Content' },
    ]);
  }),

  http.post('/api/notes', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ id: '2', ...body }, { status: 201 });
  }),
];
```

### Testing with MSW
```typescript
import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/svelte';
import { server } from '../setup';
import { http, HttpResponse } from 'msw';
import NoteList from '$lib/components/NoteList.svelte';

describe('NoteList', () => {
  it('displays notes from API', async () => {
    render(NoteList);

    await waitFor(() => {
      expect(screen.getByText('Test Note')).toBeInTheDocument();
    });
  });

  it('handles API errors', async () => {
    server.use(
      http.get('/api/notes', () => {
        return HttpResponse.json({ error: 'Server error' }, { status: 500 });
      })
    );

    render(NoteList);

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });
});
```

## Database Testing

### Mocking Drizzle
```typescript
import { vi } from 'vitest';

const mockDb = {
  select: vi.fn().mockReturnThis(),
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockResolvedValue([]),
  insert: vi.fn().mockReturnThis(),
  values: vi.fn().mockReturnThis(),
  returning: vi.fn().mockResolvedValue([{ id: '1' }]),
};

vi.mock('$lib/server/db', () => ({ db: mockDb }));
```

### Integration Tests
- Use Neon branching for isolated test databases
- Reset database state between test runs
- Test Drizzle migrations work correctly

## Playwright E2E Testing

### Playwright Configuration

Create `playwright.config.ts` in project root:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

### Required Dependencies

```json
{
  "devDependencies": {
    "@playwright/test": "^1.48.0"
  }
}
```

Install browsers: `npx playwright install`

### Playwright MCP Server

This project has a Playwright MCP server configured for interactive browser testing and debugging. When working with E2E tests:

- **Use MCP for interactive debugging**: The Playwright MCP server allows agents to interact with browsers directly for test development and debugging
- **Browser snapshots**: Use `mcp__playwright__browser_snapshot` to capture accessibility tree for element inspection
- **Visual verification**: Use `mcp__playwright__browser_take_screenshot` for visual debugging
- **Interactive testing**: Navigate, click, type, and fill forms through MCP tools during test development

### Web Testing
- Test full user journeys
- Verify SvelteKit routing
- Test form submissions end-to-end

### Tauri Desktop Testing
- Launch actual Tauri app in test mode
- Test native file operations
- Verify desktop-specific UI

## Principles

- Write tests for critical paths first (auth, data operations)
- Test behavior, not implementation details
- Mock external services with MSW
- Keep tests fast and deterministic
- Avoid testing framework code (SvelteKit, Svelte)

## Development Workflow

- Run all tests locally before pushing to `staging`
- No CI/CD - tests are developer responsibility
- Use `pnpm test` to run full test suite
- Use `pnpm test:unit:watch` during development

## Coverage Goals

- Target coverage: 80%+ for critical features
- Focus on business logic and user flows
- Don't chase coverage numbers for framework code

## Testing Patterns

### Zod Schema Testing
```typescript
import { describe, it, expect } from 'vitest';
import { noteSchema } from '$lib/schemas/note';

describe('noteSchema', () => {
  it('validates valid note', () => {
    const result = noteSchema.safeParse({ title: 'Test', content: '' });
    expect(result.success).toBe(true);
  });

  it('rejects empty title', () => {
    const result = noteSchema.safeParse({ title: '', content: '' });
    expect(result.success).toBe(false);
  });
});
```

### Svelte Component Testing
```typescript
import { render, screen } from '@testing-library/svelte';
import Button from '$lib/components/ui/button.svelte';

it('renders button text', () => {
  render(Button, { props: { children: 'Click me' } });
  expect(screen.getByRole('button')).toHaveTextContent('Click me');
});
```

### TanStack Query Testing
```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
import { render, waitFor } from '@testing-library/svelte';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

// Wrap component with QueryClientProvider in tests
```

### Store Testing
```typescript
import { get } from 'svelte/store';
import { noteStore } from '$lib/stores/noteStore';

it('updates note list', () => {
  noteStore.addNote({ id: '1', title: 'Test' });
  expect(get(noteStore).notes).toHaveLength(1);
});
```

## Test Data

- Use fixture files for test data
- Create test utilities for generating test objects
- Clean up test data after each test run
- Use factories for generating test objects
