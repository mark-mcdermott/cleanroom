<script lang="ts">
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLTableRowElement> {
		children?: Snippet;
	}

	let { class: className, children, ...restProps }: Props = $props();
</script>

<tr
	data-slot="table-row"
	class={cn(
		'transition-colors hover:bg-zinc-100 data-[state=selected]:bg-zinc-100',
		className
	)}
	{...restProps}
>
	{@render children?.()}
</tr>
