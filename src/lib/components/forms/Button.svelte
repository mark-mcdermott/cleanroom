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
		primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
		secondary: 'bg-background text-foreground border border-border hover:bg-muted'
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
