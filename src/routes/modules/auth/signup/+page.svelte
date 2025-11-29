<script lang="ts">
	import { SignUpForm } from '$lib/components/blocks';

	let { form } = $props();
</script>

<svelte:head>
	<title>Sign Up - auth-app</title>
</svelte:head>

<SignUpForm {form} loginHref="/modules/auth/login" />
