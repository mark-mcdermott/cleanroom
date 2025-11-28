<script lang="ts">
	import type { Snippet } from 'svelte';

	export interface FAQItem {
		question: string;
		answer: string | Snippet;
	}

	interface Props {
		title?: string;
		items: FAQItem[];
	}

	let { title, items }: Props = $props();
</script>

<div class="bg-zinc-50 rounded-2xl p-6">
	{#if title}
		<h3 class="font-semibold mb-4">{title}</h3>
	{/if}
	<div class="space-y-4 text-sm">
		{#each items as item}
			<div>
				<p class="font-medium text-zinc-900">{item.question}</p>
				{#if typeof item.answer === 'string'}
					<p class="text-zinc-600">{@html item.answer}</p>
				{:else}
					<p class="text-zinc-600">{@render item.answer()}</p>
				{/if}
			</div>
		{/each}
	</div>
</div>
