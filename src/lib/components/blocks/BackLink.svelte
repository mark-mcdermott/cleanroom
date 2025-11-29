<script lang="ts">
	import { ArrowLeft } from 'lucide-svelte';

	interface Props {
		href?: string;
		label?: string;
		maxWidth?: string;
	}

	let { href = '/', label = 'Back', maxWidth }: Props = $props();
</script>

<div class="{maxWidth ? `w-full ${maxWidth} mx-auto` : ''} px-6">
	<a
		{href}
		class="inline-flex items-center gap-1 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
	>
		<ArrowLeft class="w-4 h-4" />
		{label}
	</a>
</div>
