<script lang="ts">
	import { ThemeToggle } from '$lib/components/ui';
	import { Sun, Moon, Monitor } from 'lucide-svelte';
</script>

<svelte:head>
	<title>Dark Toggle - Module Demo</title>
	<meta name="description" content="Theme toggle component demo" />
</svelte:head>

<div class="max-w-2xl mx-auto px-6 py-16">
	<div class="text-center mb-12">
		<h1 class="text-3xl font-semibold tracking-tight">Dark Toggle</h1>
		<p class="text-zinc-600 dark:text-zinc-400 mt-2">
			A theme toggle component with light, dark, and system preference modes.
		</p>
	</div>

	<!-- Demo Card -->
	<div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-8 mb-8">
		<h2 class="text-lg font-semibold mb-4">Try it out</h2>
		<p class="text-zinc-600 dark:text-zinc-400 mb-6">
			Click the button below to cycle through themes: Light → Dark → System
		</p>

		<div class="flex items-center justify-center gap-8">
			<div class="text-center">
				<div class="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center mb-2">
					<ThemeToggle.Root mode="light-dark-system" class="!p-4" />
				</div>
				<p class="text-sm text-zinc-500 dark:text-zinc-400">3-way toggle</p>
			</div>

			<div class="text-center">
				<div class="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center mb-2">
					<ThemeToggle.Root mode="light-dark" class="!p-4" />
				</div>
				<p class="text-sm text-zinc-500 dark:text-zinc-400">2-way toggle</p>
			</div>
		</div>
	</div>

	<!-- Theme States -->
	<div class="grid grid-cols-3 gap-4 mb-8">
		<div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 text-center">
			<Sun class="w-8 h-8 mx-auto text-amber-500 mb-2" />
			<p class="font-medium">Light</p>
			<p class="text-sm text-zinc-500 dark:text-zinc-400">Bright theme</p>
		</div>
		<div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 text-center">
			<Moon class="w-8 h-8 mx-auto text-blue-500 mb-2" />
			<p class="font-medium">Dark</p>
			<p class="text-sm text-zinc-500 dark:text-zinc-400">Dark theme</p>
		</div>
		<div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 text-center">
			<Monitor class="w-8 h-8 mx-auto text-zinc-500 dark:text-zinc-400 mb-2" />
			<p class="font-medium">System</p>
			<p class="text-sm text-zinc-500 dark:text-zinc-400">OS preference</p>
		</div>
	</div>

	<!-- Features -->
	<div class="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-6">
		<h3 class="font-semibold mb-4">Features</h3>
		<ul class="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
			<li class="flex items-start gap-2">
				<span class="text-green-500">✓</span>
				Persists preference in localStorage
			</li>
			<li class="flex items-start gap-2">
				<span class="text-green-500">✓</span>
				Respects system preference when set to "System"
			</li>
			<li class="flex items-start gap-2">
				<span class="text-green-500">✓</span>
				Listens for system theme changes in real-time
			</li>
			<li class="flex items-start gap-2">
				<span class="text-green-500">✓</span>
				Two modes: 2-way (light/dark) or 3-way (light/dark/system)
			</li>
			<li class="flex items-start gap-2">
				<span class="text-green-500">✓</span>
				Tailwind v4 CSS variables for theming
			</li>
		</ul>
	</div>
</div>
