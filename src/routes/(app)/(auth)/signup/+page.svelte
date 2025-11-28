<script lang="ts">
	import { enhance } from '$app/forms';
	import { Card, Button, Input, Label } from '$lib/components/ui';

	let { form } = $props();
</script>

<svelte:head>
	<title>Sign Up</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center px-4">
	<Card.Root class="w-full max-w-md">
		<Card.Header>
			<Card.Title>Create an account</Card.Title>
			<Card.Description>Enter your details to sign up</Card.Description>
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
					<Label.Root for="name">Name (optional)</Label.Root>
					<Input.Root
						id="name"
						name="name"
						type="text"
						placeholder="Your name"
						autocomplete="name"
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
						autocomplete="new-password"
						minlength={8}
					/>
				</div>

				<div class="space-y-2">
					<Label.Root for="confirmPassword">Confirm Password</Label.Root>
					<Input.Root
						id="confirmPassword"
						name="confirmPassword"
						type="password"
						placeholder="••••••••"
						required
						autocomplete="new-password"
						minlength={8}
					/>
				</div>

				{#if form?.error}
					<p class="text-sm text-destructive">{form.error}</p>
				{/if}

				<Button.Root type="submit" class="w-full">Sign Up</Button.Root>
			</form>
		</Card.Content>
		<Card.Footer class="justify-center">
			<p class="text-sm text-muted-foreground">
				Already have an account?
				<a href="/login" class="text-primary hover:underline">Log in</a>
			</p>
		</Card.Footer>
	</Card.Root>
</div>
