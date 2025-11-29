<script lang="ts">
	import { cn } from '$lib/utils';
	import type { HTMLImgAttributes } from 'svelte/elements';

	interface Props extends HTMLImgAttributes {
		class?: string;
	}

	let { class: className, src, alt, ...restProps }: Props = $props();
</script>

{#if src}
	<div class={cn('w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-zinc-100', className)}>
		<img
			{src}
			{alt}
			data-slot="cart-item-image"
			class="w-full h-full object-cover"
			{...restProps}
		/>
	</div>
{:else}
	<div class={cn('w-20 h-20 flex-shrink-0 rounded-lg bg-zinc-100 flex items-center justify-center', className)}>
		<span class="text-zinc-400 text-2xl">📦</span>
	</div>
{/if}
