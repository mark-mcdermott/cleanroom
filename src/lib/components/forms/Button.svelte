<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		type?: 'submit' | 'button' | 'reset';
		variant?: 'primary' | 'secondary';
		fullWidth?: boolean;
		disabled?: boolean;
		children: Snippet;
	}

	let {
		type = 'submit',
		variant = 'primary',
		fullWidth = true,
		disabled = false,
		children
	}: Props = $props();

	const variants = {
		primary: 'bg-zinc-900 text-white hover:bg-zinc-800',
		secondary: 'bg-white text-zinc-900 border border-zinc-300 hover:bg-zinc-50'
	};
</script>

<button
	{type}
	{disabled}
	class="px-6 py-3 rounded-lg transition-colors font-medium {variants[variant]} {fullWidth
		? 'w-full'
		: ''} {disabled ? 'opacity-50 cursor-not-allowed' : ''}"
>
	{@render children()}
</button>
