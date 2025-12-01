<script lang="ts">
	import { page } from '$app/stores';
	import { ProfilePage } from '$lib/components/blocks';

	const { data } = $props();
	const userId = $derived($page.params.id ?? '');
</script>

<svelte:head>
	<title>Profile - cleanroom</title>
	<meta name="description" content="User Profile" />
</svelte:head>

<ProfilePage
	user={{
		id: userId,
		email: data.user?.email ?? '',
		name: data.user?.name,
		avatarUrl: data.user?.avatarUrl
	}}
	currentUserId={data.user?.id}
	backHref={null}
/>
