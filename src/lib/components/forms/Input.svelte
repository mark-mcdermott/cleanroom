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
		<label for={name} class="block text-sm font-medium text-muted-foreground mb-2">
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
		class="w-full px-4 py-3 border rounded-lg outline-none transition-shadow bg-background text-foreground {error
			? 'border-destructive focus:ring-2 focus:ring-destructive'
			: 'border-border focus:ring-2 focus:ring-ring focus:border-transparent'} {disabled
			? 'bg-muted cursor-not-allowed'
			: ''}"
	/>
	{#if error}
		<p class="text-red-500 text-sm mt-1">{error[0]}</p>
	{/if}
</div>
