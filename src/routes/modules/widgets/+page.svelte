<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>Widgets Demo - Cleanroom</title>
	<meta name="description" content="Widgets demo module" />
</svelte:head>

<div class="max-w-4xl mx-auto px-6 py-16">
	{#if data.needsSetup}
		<div class="text-center">
			<h1 class="text-3xl font-semibold tracking-tight mb-4">Setup Required</h1>
			<p class="text-muted-foreground mb-6">
				No demo users found. Please reset the demo from the Auth module first.
			</p>
			<a
				href="/modules/auth/admin/users"
				class="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
			>
				Go to Auth Module
			</a>
		</div>
	{:else if data.needsLogin}
		<div class="text-center">
			<h1 class="text-3xl font-semibold tracking-tight mb-4">Database Not Configured</h1>
			<p class="text-muted-foreground">Please configure the database connection.</p>
		</div>
	{:else}
		<div class="text-center">
			<p class="text-muted-foreground">Redirecting...</p>
		</div>
	{/if}
</div>
