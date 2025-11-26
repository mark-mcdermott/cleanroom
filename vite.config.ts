import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}', 'tests/unit/**/*.{test,spec}.{js,ts}'],
		environment: 'jsdom',
		globals: true,
		// Exclude cloudflare adapter during tests
		server: {
			deps: {
				inline: [/@sveltejs\/adapter-cloudflare/]
			}
		}
	}
});
