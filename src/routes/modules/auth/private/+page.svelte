<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>Private - auth-app</title>
	<meta name="description" content="Your private dashboard" />
</svelte:head>

<div class="max-w-4xl mx-auto px-6 py-16">
	<div class="text-center mb-12">
		<div class="text-5xl mb-4">🔐</div>
		<h1 class="text-4xl font-semibold tracking-tight">Private Area</h1>
		<p class="text-zinc-600 dark:text-zinc-400 text-lg mt-4">
			Welcome{data.user.name ? `, ${data.user.name}` : ''}! This page is only visible to authenticated users.
		</p>
	</div>

	<div class="grid sm:grid-cols-2 gap-6 mb-12">
		<div class="card">
			<div class="text-2xl mb-2">👤</div>
			<h3 class="font-semibold mb-2">Your Profile</h3>
			<p class="text-sm text-zinc-600 dark:text-zinc-400 mb-3">Manage your account settings and preferences.</p>
			<p class="text-xs text-zinc-500 dark:text-zinc-400">Email: {data.user.email}</p>
		</div>
		<div class="card">
			<div class="text-2xl mb-2">📊</div>
			<h3 class="font-semibold mb-2">Dashboard</h3>
			<p class="text-sm text-zinc-600 dark:text-zinc-400">View your activity, stats, and personalized content.</p>
		</div>
		<div class="card">
			<div class="text-2xl mb-2">⚙️</div>
			<h3 class="font-semibold mb-2">Settings</h3>
			<p class="text-sm text-zinc-600 dark:text-zinc-400">Configure notifications, privacy, and app preferences.</p>
		</div>
		<div class="card">
			<div class="text-2xl mb-2">🔔</div>
			<h3 class="font-semibold mb-2">Notifications</h3>
			<p class="text-sm text-zinc-600 dark:text-zinc-400">Stay updated with the latest alerts and messages.</p>
		</div>
	</div>

	<div class="card text-center py-8">
		<h2 class="text-xl font-semibold mb-2">Protected Content</h2>
		<p class="text-zinc-600 dark:text-zinc-400 mb-4">
			This demonstrates how authentication protects routes. Unauthenticated users are redirected to the login page.
		</p>
		<p class="text-sm text-zinc-500 dark:text-zinc-400">
			Try logging out and navigating directly to <code class="bg-zinc-100 px-1 rounded">/modules/auth/private</code>
		</p>
	</div>
</div>
