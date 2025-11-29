<script lang="ts">
	import { LoginForm } from '$lib/components/blocks';

	let { form } = $props();
</script>

<svelte:head>
	<title>Log In - auth-app</title>
</svelte:head>

<LoginForm {form} signupHref="/modules/auth/signup" />
