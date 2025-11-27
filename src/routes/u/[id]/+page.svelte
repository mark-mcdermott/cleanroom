<script lang="ts">
	import { page } from '$app/stores';
	import { Card } from '$lib/components/ui';
	import { User, Mail, Calendar } from 'lucide-svelte';

	const { data } = $props();
	const userId = $derived($page.params.id);
	const isOwnProfile = $derived(data.user?.id === userId);
</script>

<svelte:head>
	<title>Profile - Cleanroom</title>
	<meta name="description" content="User Profile" />
</svelte:head>

<div class="max-w-2xl mx-auto px-6 py-12">
	<Card.Root>
		<Card.Header>
			<div class="flex items-center gap-4">
				<div
					class="w-16 h-16 rounded-full bg-zinc-300 flex items-center justify-center text-zinc-600 text-2xl"
				>
					{data.user?.email?.charAt(0).toUpperCase() || 'U'}
				</div>
				<div>
					<Card.Title class="text-2xl">
						{#if isOwnProfile}
							Your Profile
						{:else}
							User Profile
						{/if}
					</Card.Title>
					<Card.Description>
						{#if data.user?.name}
							{data.user.name}
						{:else}
							User ID: {userId}
						{/if}
					</Card.Description>
				</div>
			</div>
		</Card.Header>
		<Card.Content class="space-y-4">
			{#if data.user && isOwnProfile}
				<div class="flex items-center gap-3 text-zinc-600">
					<Mail class="w-5 h-5" />
					<span>{data.user.email}</span>
				</div>
				<div class="flex items-center gap-3 text-zinc-600">
					<User class="w-5 h-5" />
					<span>ID: {data.user.id}</span>
				</div>
			{:else}
				<p class="text-zinc-500">Profile information is private.</p>
			{/if}
		</Card.Content>
		{#if isOwnProfile}
			<Card.Footer>
				<a
					href="/account"
					class="text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
				>
					Edit your settings →
				</a>
			</Card.Footer>
		{/if}
	</Card.Root>
</div>
