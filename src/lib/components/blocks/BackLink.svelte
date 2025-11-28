<script lang="ts">
	import { ArrowLeft } from 'lucide-svelte';

	interface Props {
		href?: string;
		label?: string;
	}

	let { href = '/', label = 'Back' }: Props = $props();
</script>

<div class="px-8">
	<a
		{href}
		class="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700"
	>
		<ArrowLeft class="w-4 h-4" />
		{label}
	</a>
</div>
