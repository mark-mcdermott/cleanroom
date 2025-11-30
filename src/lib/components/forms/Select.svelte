<script lang="ts">
	export interface SelectOption {
		value: string;
		label: string;
	}

	interface Props {
		name: string;
		value?: string;
		label?: string;
		options: SelectOption[];
		placeholder?: string;
		error?: string[];
		required?: boolean;
		disabled?: boolean;
	}

	let {
		name,
		value = $bindable(''),
		label,
		options,
		placeholder = 'Select an option...',
		error,
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
	<select
		id={name}
		{name}
		bind:value
		{required}
		{disabled}
		class="w-full px-4 py-3 border rounded-lg outline-none transition-shadow bg-background text-foreground {error
			? 'border-destructive focus:ring-2 focus:ring-destructive'
			: 'border-border focus:ring-2 focus:ring-ring focus:border-transparent'} {disabled
			? 'bg-muted cursor-not-allowed'
			: ''}"
	>
		{#if placeholder}
			<option value="">{placeholder}</option>
		{/if}
		{#each options as option}
			<option value={option.value}>{option.label}</option>
		{/each}
	</select>
	{#if error}
		<p class="text-red-500 text-sm mt-1">{error[0]}</p>
	{/if}
</div>
