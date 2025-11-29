<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button, Card } from '$lib/components/ui';
	import { FileText, Plus, Edit, Trash2, Download } from 'lucide-svelte';

	let { data } = $props();

	function formatDate(date: Date | string) {
		return new Date(date).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>My Resumes - Resume Builder</title>
	<meta name="description" content="Manage your resumes" />
</svelte:head>

<div class="max-w-4xl mx-auto px-6 py-16">
	<div class="flex items-center justify-between mb-8">
		<div>
			<h1 class="text-3xl font-semibold tracking-tight flex items-center gap-3">
				<FileText class="w-8 h-8 text-blue-600" />
				My Resumes
			</h1>
			<p class="text-zinc-600 mt-2">Create and manage your professional resumes</p>
		</div>
		{#if data.user}
			<Button.Root onclick={() => goto('/modules/resume/new')} class="cursor-pointer">
				<Plus class="w-4 h-4 mr-2" />
				New Resume
			</Button.Root>
		{/if}
	</div>

	{#if !data.user}
		<div class="bg-white border border-zinc-200 rounded-lg p-12 text-center">
			<FileText class="w-16 h-16 mx-auto text-zinc-300 mb-4" />
			<p class="text-zinc-600 mb-4">Please log in to create and manage your resumes</p>
			<Button.Root onclick={() => goto('/modules/resume/login')} class="cursor-pointer">
				Log In
			</Button.Root>
		</div>
	{:else if data.resumes.length === 0}
		<div class="bg-white border border-zinc-200 rounded-lg p-12 text-center">
			<FileText class="w-16 h-16 mx-auto text-zinc-300 mb-4" />
			<p class="text-zinc-600 mb-4">You haven't created any resumes yet</p>
			<Button.Root onclick={() => goto('/modules/resume/new')} class="cursor-pointer">
				<Plus class="w-4 h-4 mr-2" />
				Create Your First Resume
			</Button.Root>
		</div>
	{:else}
		<div class="grid gap-4">
			{#each data.resumes as resume}
				<Card.Root class="hover:shadow-md transition-shadow">
					<Card.Content class="p-6">
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-4">
								<div class="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
									<FileText class="w-6 h-6 text-blue-600" />
								</div>
								<div>
									<h2 class="font-semibold text-lg">{resume.title}</h2>
									<p class="text-sm text-zinc-500">
										Last updated {formatDate(resume.updatedAt)}
									</p>
								</div>
							</div>
							<div class="flex items-center gap-2">
								<Button.Root
									variant="outline"
									size="sm"
									onclick={() => goto(`/modules/resume/${resume.id}`)}
									class="cursor-pointer"
								>
									<Edit class="w-4 h-4 mr-1" />
									Edit
								</Button.Root>
								<Button.Root
									variant="outline"
									size="sm"
									onclick={() => goto(`/modules/resume/${resume.id}?export=pdf`)}
									class="cursor-pointer"
								>
									<Download class="w-4 h-4 mr-1" />
									PDF
								</Button.Root>
								<form method="POST" action="/modules/resume/{resume.id}?/delete" class="inline">
									<Button.Root
										type="submit"
										variant="ghost"
										size="sm"
										class="text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
									>
										<Trash2 class="w-4 h-4" />
									</Button.Root>
								</form>
							</div>
						</div>
					</Card.Content>
				</Card.Root>
			{/each}
		</div>
	{/if}
</div>
