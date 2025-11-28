<script lang="ts">
	import { enhance } from '$app/forms';
	import { Card, Button, Input, Label } from '$lib/components/ui';

	let { form } = $props();
</script>

<svelte:head>
	<title>Log In</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center px-4">
	<Card.Root class="w-full max-w-md">
		<Card.Header>
			<Card.Title>Welcome back</Card.Title>
			<Card.Description>Enter your credentials to log in</Card.Description>
		</Card.Header>
		<Card.Content>
			<form method="POST" use:enhance class="space-y-4">
				<div class="space-y-2">
					<Label.Root for="email">Email</Label.Root>
					<Input.Root
						id="email"
						name="email"
						type="email"
						placeholder="you@example.com"
						required
						autocomplete="email"
					/>
				</div>

				<div class="space-y-2">
					<Label.Root for="password">Password</Label.Root>
					<Input.Root
						id="password"
						name="password"
						type="password"
						placeholder="••••••••"
						required
						autocomplete="current-password"
					/>
				</div>

				{#if form?.error}
					<p class="text-sm text-destructive">{form.error}</p>
				{/if}

				<Button.Root type="submit" class="w-full">Log In</Button.Root>
			</form>
		</Card.Content>
		<Card.Footer class="justify-center">
			<p class="text-sm text-muted-foreground">
				Don't have an account?
				<a href="/signup" class="text-primary hover:underline">Sign up</a>
			</p>
		</Card.Footer>
	</Card.Root>
</div>
