<script lang="ts">
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLParagraphElement> {
		class?: string;
		children?: Snippet;
	}

	let { class: className, children, ...restProps }: Props = $props();
</script>

<p
	data-slot="post-card-excerpt"
	class={cn('text-zinc-600 dark:text-zinc-400 mt-2 leading-relaxed', className)}
	{...restProps}
>
	{#if children}
		{@render children()}
	{/if}
</p>
