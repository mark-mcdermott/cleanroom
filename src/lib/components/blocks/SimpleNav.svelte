<script lang="ts">
	// SimpleNav - A minimal navigation bar with logo and links
	interface NavLink {
		href: string;
		label: string;
	}

	interface Props {
		projectName?: string;
		logoEmoji?: string;
		logoSrc?: string;
		links?: NavLink[];
	}

	let {
		projectName = 'cleanroom',
		logoEmoji = '✨',
		logoSrc,
		links = [
			{ href: '/components', label: 'components' },
			{ href: '/blocks', label: 'blocks' }
		]
	}: Props = $props();
</script>

<nav class="w-full flex items-center justify-between px-8 py-6">
	<a href="/" class="flex items-center gap-2 text-2xl no-underline hover:no-underline">
		{#if logoSrc}
			<img src={logoSrc} alt={projectName} class="w-8 h-8" />
		{:else}
			<span>{logoEmoji}</span>
		{/if}
		<span class="font-semibold text-lg tracking-tight">{projectName}</span>
	</a>
	<div class="flex gap-6">
		{#each links as link}
			<a href={link.href} class="text-sm text-zinc-700 hover:text-zinc-900 transition-colors">
				{link.label}
			</a>
		{/each}
	</div>
</nav>
