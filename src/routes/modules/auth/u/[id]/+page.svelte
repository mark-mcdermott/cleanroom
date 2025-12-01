<script lang="ts">
	import { ArrowLeft } from 'lucide-svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>{data.profileUser.name || data.profileUser.email} - Profile</title>
	<meta name="description" content="User profile" />
</svelte:head>

<div class="max-w-2xl mx-auto px-6 py-16">
	<a
		href="/modules/auth"
		class="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
	>
		<ArrowLeft class="w-4 h-4" />
		Back to Home
	</a>

	<div class="bg-card border border-border rounded-lg p-6">
		<div class="flex items-start gap-4 mb-6">
			<div class="w-16 h-16 bg-muted rounded-full flex items-center justify-center text-2xl font-medium">
				{data.profileUser.name?.charAt(0).toUpperCase() || data.profileUser.email.charAt(0).toUpperCase()}
			</div>
			<div class="flex-1">
				<h1 class="text-2xl font-semibold tracking-tight">
					{data.profileUser.name || 'Anonymous User'}
				</h1>
				<p class="text-muted-foreground">{data.profileUser.email}</p>
			</div>
		</div>

		<div class="space-y-3 text-sm border-t border-border pt-6">
			<div class="flex justify-between">
				<span class="text-muted-foreground">Member since</span>
				<span class="text-muted-foreground">
					{data.profileUser.createdAt ? new Date(data.profileUser.createdAt).toLocaleDateString() : 'N/A'}
				</span>
			</div>
		</div>
	</div>
</div>
