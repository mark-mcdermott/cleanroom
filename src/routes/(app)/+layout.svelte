<script lang="ts">
	import { Nav, Footer } from '$lib/components/blocks';
	import { Sonner } from '$lib/components/ui';
	import { defaultNavLinks, getDefaultAvatarLinks } from '$lib/config/nav';

	let { children, data } = $props();

	const profileUrl = $derived(data.user?.id ? `/u/${data.user.id}` : '#');
	const avatarLinks = $derived(getDefaultAvatarLinks(profileUrl));
</script>

<Sonner.Toaster richColors />
<div class="min-h-dvh flex flex-col">
	<Nav siteName="cleanroom" logo="/skull.svg" user={data.user} isAdmin={data.user?.admin} links={defaultNavLinks} avatar={{ links: avatarLinks }} showThemeToggle />

	<main class="flex-1">
		{@render children()}
	</main>

	<Footer siteName="cleanroom" logo="/skull.svg" showDbStatus={true} dbConnected={data.dbConnected} />
</div>
