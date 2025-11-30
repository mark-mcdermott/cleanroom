<script lang="ts">
	interface Props {
		name: string;
		checked?: boolean;
		label?: string;
		error?: string[];
		disabled?: boolean;
	}

	let {
		name,
		checked = $bindable(false),
		label,
		error,
		disabled = false
	}: Props = $props();
</script>

<div>
	<label class="flex items-center gap-3 cursor-pointer {disabled ? 'cursor-not-allowed opacity-50' : ''}">
		<button
			type="button"
			role="switch"
			aria-checked={checked}
			aria-label={label || name}
			id={name}
			{disabled}
			onclick={() => !disabled && (checked = !checked)}
			class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 {checked
				? 'bg-primary'
				: 'bg-muted'} {disabled ? 'cursor-not-allowed' : ''}"
		>
			<span
				class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out {checked
					? 'translate-x-5'
					: 'translate-x-0'}"
			></span>
		</button>
		{#if label}
			<span class="text-sm font-medium text-muted-foreground">{label}</span>
		{/if}
	</label>
	{#if error}
		<p class="text-red-500 text-sm mt-1">{error[0]}</p>
	{/if}
</div>
