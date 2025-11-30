<script lang="ts">
	interface Props {
		name: string;
		checked?: boolean;
		label?: string;
		error?: string[];
		required?: boolean;
		disabled?: boolean;
	}

	let {
		name,
		checked = $bindable(false),
		label,
		error,
		required = false,
		disabled = false
	}: Props = $props();
</script>

<div>
	<label class="flex items-center gap-3 cursor-pointer {disabled ? 'cursor-not-allowed opacity-50' : ''}">
		<input
			type="checkbox"
			id={name}
			{name}
			bind:checked
			{required}
			{disabled}
			class="w-5 h-5 rounded border-border text-primary focus:ring-2 focus:ring-ring focus:ring-offset-0 {error
				? 'border-destructive'
				: ''}"
		/>
		{#if label}
			<span class="text-sm font-medium text-muted-foreground">
				{label}{#if required}<span class="text-red-500 ml-1">*</span>{/if}
			</span>
		{/if}
	</label>
	{#if error}
		<p class="text-red-500 text-sm mt-1">{error[0]}</p>
	{/if}
</div>
