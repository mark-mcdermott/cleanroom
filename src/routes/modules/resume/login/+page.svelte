<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button, Input, Label, Card } from '$lib/components/ui';
	import { LogIn } from 'lucide-svelte';

	let { form } = $props();
</script>

<svelte:head>
	<title>Login - Resume Builder</title>
</svelte:head>

<div class="max-w-md mx-auto px-6 py-16">
	<Card.Root>
		<Card.Header>
			<Card.Title class="flex items-center gap-2">
				<LogIn class="w-5 h-5" />
				Log In
			</Card.Title>
			<Card.Description>Sign in to manage your resumes</Card.Description>
		</Card.Header>
		<Card.Content>
			<form method="POST" use:enhance class="space-y-4">
				{#if form?.error}
					<div class="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
						{form.error}
					</div>
				{/if}

				<div class="space-y-2">
					<Label.Root for="email">Email</Label.Root>
					<Input.Root type="email" id="email" name="email" required />
				</div>

				<div class="space-y-2">
					<Label.Root for="password">Password</Label.Root>
					<Input.Root type="password" id="password" name="password" required />
				</div>

				<Button.Root type="submit" class="w-full cursor-pointer">
					Log In
				</Button.Root>
			</form>
		</Card.Content>
		<Card.Footer class="justify-center">
			<p class="text-sm text-muted-foreground">
				Don't have an account?
				<a href="/modules/resume/signup" class="text-blue-600 hover:underline">Sign up</a>
			</p>
		</Card.Footer>
	</Card.Root>
</div>
