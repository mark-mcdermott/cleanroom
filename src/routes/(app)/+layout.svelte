<script lang="ts">
	import { Nav, Footer } from '$lib/components/blocks';
	import { defaultNavLinks, getDefaultAvatarLinks } from '$lib/config/nav';

	let { children, data } = $props();

	const profileUrl = $derived(data.user?.id ? `/u/${data.user.id}` : '#');
	const avatarLinks = $derived(getDefaultAvatarLinks(profileUrl));
</script>

<div class="min-h-dvh flex flex-col">
	<Nav siteName="cleanroom" logo="/skull.svg" user={data.user} links={defaultNavLinks} avatar={{ links: avatarLinks }} />

	<main class="flex-1">
		{@render children()}
	</main>

	<Footer siteName="cleanroom" logo="/skull.svg" showDbStatus={true} dbConnected={data.dbConnected} />
</div>
