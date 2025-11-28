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
		<label for={name} class="block text-sm font-medium text-zinc-700 mb-2">
			{label}{#if required}<span class="text-red-500 ml-1">*</span>{/if}
		</label>
	{/if}
	<select
		id={name}
		{name}
		bind:value
		{required}
		{disabled}
		class="w-full px-4 py-3 border rounded-lg outline-none transition-shadow bg-white {error
			? 'border-red-500 focus:ring-2 focus:ring-red-500'
			: 'border-zinc-300 focus:ring-2 focus:ring-zinc-900 focus:border-transparent'} {disabled
			? 'bg-zinc-100 cursor-not-allowed'
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
