<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button, Input, Label, Card } from '$lib/components/ui';
	import { UserPlus } from 'lucide-svelte';

	let { form } = $props();
</script>

<svelte:head>
	<title>Sign Up - Resume Builder</title>
</svelte:head>

<div class="max-w-md mx-auto px-6 py-16">
	<Card.Root>
		<Card.Header>
			<Card.Title class="flex items-center gap-2">
				<UserPlus class="w-5 h-5" />
				Sign Up
			</Card.Title>
			<Card.Description>Create an account to build your resume</Card.Description>
		</Card.Header>
		<Card.Content>
			<form method="POST" use:enhance class="space-y-4">
				{#if form?.error}
					<div class="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
						{form.error}
					</div>
				{/if}

				<div class="space-y-2">
					<Label.Root for="name">Name (optional)</Label.Root>
					<Input.Root type="text" id="name" name="name" />
				</div>

				<div class="space-y-2">
					<Label.Root for="email">Email</Label.Root>
					<Input.Root type="email" id="email" name="email" required />
				</div>

				<div class="space-y-2">
					<Label.Root for="password">Password</Label.Root>
					<Input.Root type="password" id="password" name="password" required minlength={6} />
					<p class="text-xs text-muted-foreground">At least 6 characters</p>
				</div>

				<Button.Root type="submit" class="w-full cursor-pointer">
					Create Account
				</Button.Root>
			</form>
		</Card.Content>
		<Card.Footer class="justify-center">
			<p class="text-sm text-muted-foreground">
				Already have an account?
				<a href="/modules/resume/login" class="text-blue-600 hover:underline">Log in</a>
			</p>
		</Card.Footer>
	</Card.Root>
</div>
