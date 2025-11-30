<script lang="ts">
	export interface RadioOption {
		value: string;
		label: string;
	}

	interface Props {
		name: string;
		value?: string;
		label?: string;
		options: RadioOption[];
		error?: string[];
		required?: boolean;
		disabled?: boolean;
	}

	let {
		name,
		value = $bindable(''),
		label,
		options,
		error,
		required = false,
		disabled = false
	}: Props = $props();
</script>

<div>
	{#if label}
		<p class="block text-sm font-medium text-muted-foreground mb-3">
			{label}{#if required}<span class="text-red-500 ml-1">*</span>{/if}
		</p>
	{/if}
	<div class="space-y-3">
		{#each options as option}
			<label class="flex items-center gap-3 cursor-pointer {disabled ? 'cursor-not-allowed opacity-50' : ''}">
				<input
					type="radio"
					{name}
					value={option.value}
					bind:group={value}
					{required}
					{disabled}
					class="w-5 h-5 border-border text-primary focus:ring-2 focus:ring-ring focus:ring-offset-0 {error
						? 'border-destructive'
						: ''}"
				/>
				<span class="text-sm text-muted-foreground">{option.label}</span>
			</label>
		{/each}
	</div>
	{#if error}
		<p class="text-red-500 text-sm mt-2">{error[0]}</p>
	{/if}
</div>
