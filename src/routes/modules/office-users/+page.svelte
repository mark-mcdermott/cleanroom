<script lang="ts">
	import { Users } from 'lucide-svelte';

	let { data } = $props();

	// Office character avatars (initials + colors)
	const characterColors: Record<string, string> = {
		'Michael Scott': 'bg-blue-500',
		'Dwight Schrute': 'bg-amber-600',
		'Jim Halpert': 'bg-green-500',
		'Pam Beesly': 'bg-pink-500',
		'Ryan Howard': 'bg-purple-500',
		'Andy Bernard': 'bg-red-500',
		'Angela Martin': 'bg-gray-500',
		'Kevin Malone': 'bg-orange-500',
		'Oscar Martinez': 'bg-teal-500',
		'Stanley Hudson': 'bg-indigo-500',
		'Phyllis Vance': 'bg-rose-500',
		'Meredith Palmer': 'bg-emerald-500',
		'Creed Bratton': 'bg-slate-600',
		'Kelly Kapoor': 'bg-fuchsia-500',
		'Toby Flenderson': 'bg-stone-500',
		'Darryl Philbin': 'bg-cyan-600',
		'Erin Hannon': 'bg-lime-500',
		'Gabe Lewis': 'bg-violet-500',
		'Holly Flax': 'bg-sky-500',
		'Jan Levinson': 'bg-amber-500'
	};

	function getColor(name: string | null): string {
		return characterColors[name || ''] || 'bg-zinc-500';
	}

	function getInitials(name: string | null): string {
		if (!name) return '?';
		return name
			.split(' ')
			.map((n) => n[0])
			.join('')
			.toUpperCase();
	}
</script>

<svelte:head>
	<title>Office Users - Module Demo</title>
	<meta name="description" content="Seed users from The Office TV show" />
</svelte:head>

<div class="max-w-4xl mx-auto px-6 py-16">
	<div class="text-center mb-12">
		<div class="flex items-center justify-center gap-3 mb-4">
			<Users class="w-10 h-10 text-blue-600" />
			<h1 class="text-3xl font-semibold tracking-tight">Office Users</h1>
		</div>
		<p class="text-zinc-600">
			Seed your database with characters from The Office for testing.
		</p>
	</div>

	{#if data.users.length === 0}
		<div class="bg-white border border-zinc-200 rounded-lg p-8 text-center">
			<Users class="w-16 h-16 mx-auto text-zinc-300 mb-4" />
			<p class="text-zinc-600 mb-4">No users in the database yet.</p>
			<p class="text-sm text-zinc-500 mb-6">
				When you scaffold a project with this module, run:
			</p>
			<code class="bg-zinc-100 px-4 py-2 rounded font-mono text-sm">pnpm db:seed-office</code>
			<p class="text-sm text-zinc-500 mt-6">
				This will seed 20 characters from The Office with the password: <strong>dundermifflin</strong>
			</p>
		</div>
	{:else}
		<div class="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
			<p class="text-sm text-blue-800">
				<strong>Tip:</strong> All users have the password <code class="bg-blue-100 px-1 rounded">dundermifflin</code>
			</p>
		</div>

		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
			{#each data.users as user}
				<div class="bg-white border border-zinc-200 rounded-lg p-4 hover:border-zinc-300 transition-colors">
					<div class="flex items-center gap-3">
						<div
							class="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm {getColor(
								user.name
							)}"
						>
							{getInitials(user.name)}
						</div>
						<div class="min-w-0 flex-1">
							<h3 class="font-medium truncate">{user.name || 'Unknown'}</h3>
							<p class="text-xs text-zinc-500 truncate">{user.email}</p>
						</div>
					</div>
				</div>
			{/each}
		</div>

		<p class="text-center text-sm text-zinc-500 mt-8">
			{data.users.length} users from Dunder Mifflin Scranton
		</p>
	{/if}
</div>
