<script lang="ts">
	import { AuthNav } from '$lib/components/blocks';
	import { Database, CheckCircle, XCircle } from 'lucide-svelte';

	let { children, data } = $props();
</script>

<div class="min-h-dvh flex flex-col">
	<AuthNav user={data.user} />

	<main class="flex-1">
		{@render children()}
	</main>

	<footer class="border-t">
		<div
			class="mx-auto max-w-6xl px-6 sm:px-10 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-zinc-600"
		>
			<div class="flex items-center gap-2">
				<img src="/logo.png" alt="Cleanroom" class="w-5 h-5" />
				<span>&copy; {new Date().getFullYear()} Cleanroom</span>
			</div>
			<div class="flex items-center gap-4">
				{#if data.dbConnected}
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
			</div>
		</div>
	</footer>
</div>
