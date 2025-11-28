<script lang="ts">
	import { Database, CheckCircle, XCircle } from 'lucide-svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		siteName?: string;
		logo?: string;
		logoIcon?: Snippet;
		showDbStatus?: boolean;
		dbConnected?: boolean;
		children?: Snippet;
	}

	let {
		siteName = 'cleanroom',
		logo,
		logoIcon,
		showDbStatus = false,
		dbConnected = false,
		children
	}: Props = $props();

	const year = new Date().getFullYear();

	// Detect if logo is an image path or text/emoji
	const isLogoImage = $derived(
		logo?.startsWith('/') ||
			logo?.startsWith('http') ||
			logo?.endsWith('.png') ||
			logo?.endsWith('.jpg') ||
			logo?.endsWith('.svg')
	);
</script>

<footer class="border-t">
	<div
		class="mx-auto max-w-6xl px-6 sm:px-10 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-zinc-600"
	>
		<div class="flex items-center gap-2">
			{#if logoIcon}
				<span class="w-5 h-5">
					{@render logoIcon()}
				</span>
			{:else if logo}
				{#if isLogoImage}
					<img src={logo} alt={siteName} class="w-5 h-5" />
				{:else}
					<span>{logo}</span>
				{/if}
			{/if}
			<span>&copy; {year} {siteName}</span>
		</div>

		<div class="flex items-center gap-4">
			{#if children}
				{@render children()}
			{/if}

			{#if showDbStatus}
				{#if dbConnected}
					<span class="flex items-center gap-1 text-emerald-600">
						<Database class="w-4 h-4" />
						<CheckCircle class="w-3 h-3" />
						<span class="text-xs">Connected</span>
					</span>
				{:else}
					<span class="flex items-center gap-1 text-zinc-400">
						<Database class="w-4 h-4" />
						<XCircle class="w-3 h-3" />
						<span class="text-xs">Not connected</span>
					</span>
				{/if}
			{/if}
		</div>
	</div>
</footer>
