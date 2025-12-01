<script lang="ts">
	import { AccountPage } from '$lib/components/blocks';

	const { data, form } = $props();
</script>

<svelte:head>
	<title>Settings - cleanroom</title>
	<meta name="description" content="Account Settings" />
</svelte:head>

<AccountPage
	user={data.user ? { id: data.user.id, email: data.user.email, name: data.user.name } : null}
	{form}
	backHref={null}
/>
