<script lang="ts">
	interface Props {
		name: string;
		value?: string;
		label?: string;
		placeholder?: string;
		error?: string[];
		type?: 'text' | 'password' | 'tel' | 'url';
		required?: boolean;
		disabled?: boolean;
	}

	let {
		name,
		value = $bindable(''),
		label,
		placeholder,
		error,
		type = 'text',
		required = false,
		disabled = false
	}: Props = $props();
</script>

<div>
	{#if label}
		<label for={name} class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
			{label}{#if required}<span class="text-red-500 ml-1">*</span>{/if}
		</label>
	{/if}
	<input
		{type}
		id={name}
		{name}
		bind:value
		{placeholder}
		{required}
		{disabled}
		class="w-full px-4 py-3 border rounded-lg outline-none transition-shadow {error
			? 'border-red-500 focus:ring-2 focus:ring-red-500'
			: 'border-zinc-300 focus:ring-2 focus:ring-zinc-900 focus:border-transparent'} {disabled
			? 'bg-zinc-100 cursor-not-allowed'
			: ''}"
	/>
	{#if error}
		<p class="text-red-500 text-sm mt-1">{error[0]}</p>
	{/if}
</div>
