<script lang="ts">
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLTableSectionElement> {
		children?: Snippet;
	}

	let { class: className, children, ...restProps }: Props = $props();
</script>

<tbody data-slot="table-body" class={cn('bg-white divide-y divide-zinc-200', className)} {...restProps}>
	{@render children?.()}
</tbody>
