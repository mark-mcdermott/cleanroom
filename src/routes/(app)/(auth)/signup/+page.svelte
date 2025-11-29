<script lang="ts">
	import { SignUpForm } from '$lib/components/blocks';

	let { form } = $props();
</script>

<svelte:head>
	<title>Sign Up</title>
</svelte:head>

<SignUpForm {form} />
