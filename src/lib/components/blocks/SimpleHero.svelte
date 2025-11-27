<script lang="ts">
	// SimpleHero - A minimal hero section with logo and project name
	interface Props {
		projectName?: string;
		logoEmoji?: string;
		logoSrc?: string;
		tagline?: string;
	}

	let {
		projectName = 'Cleanroom',
		logoEmoji = '✨',
		logoSrc,
		tagline = 'Less Boilerplate, More Boil'
	}: Props = $props();
</script>

<div class="w-full flex justify-center items-center text-center min-h-[60vh]">
	<div class="my-32 sm:my-48">
		<h1 class="text-4xl sm:text-5xl font-semibold tracking-tight flex items-center justify-center gap-3">
			{#if logoSrc}
				<img src={logoSrc} alt={projectName} class="w-12 h-12 sm:w-16 sm:h-16" />
			{:else}
				<span class="text-5xl sm:text-6xl">{logoEmoji}</span>
			{/if}
			{projectName}
		</h1>
		{#if tagline}
			<p class="text-zinc-600 text-lg mt-4">{tagline}</p>
		{/if}
	</div>
</div>
