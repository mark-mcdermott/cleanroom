<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>Cleanroom</title>
	<meta name="description" content="Cleanroom - SvelteKit Scaffolding Generator" />
</svelte:head>

<h1>Hello World</h1>

<p>Database connected: {data.dbConnected ? 'Yes' : 'No'}</p>
<p>Users in database: {data.userCount}</p>
