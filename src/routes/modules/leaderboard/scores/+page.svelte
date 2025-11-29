<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button, Table } from '$lib/components/ui';
	import { Trophy, Medal, Gamepad2 } from 'lucide-svelte';

	let { data } = $props();

	function formatDate(date: Date | string) {
		return new Date(date).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
			hour: 'numeric',
			minute: '2-digit'
		});
	}

	function getRankIcon(index: number) {
		if (index === 0) return { color: 'text-yellow-500', bg: 'bg-yellow-50' };
		if (index === 1) return { color: 'text-zinc-400', bg: 'bg-zinc-50' };
		if (index === 2) return { color: 'text-amber-600', bg: 'bg-amber-50' };
		return { color: 'text-zinc-500', bg: '' };
	}
</script>

<svelte:head>
	<title>Leaderboard - Click Game</title>
	<meta name="description" content="View the top scores in the Click Game" />
</svelte:head>

<div class="max-w-4xl mx-auto px-6 py-16">
	<div class="flex items-center justify-between mb-8">
		<div>
			<h1 class="text-3xl font-semibold tracking-tight flex items-center gap-3">
				<Trophy class="w-8 h-8 text-yellow-500" />
				Leaderboard
			</h1>
			<p class="text-zinc-600 mt-2">Top scores from the Click Game</p>
		</div>
		<Button.Root onclick={() => goto('/modules/leaderboard')} class="cursor-pointer">
			<Gamepad2 class="w-4 h-4 mr-2" />
			Play Game
		</Button.Root>
	</div>

	{#if data.scores.length === 0}
		<div class="bg-white border border-zinc-200 rounded-lg p-12 text-center">
			<Trophy class="w-16 h-16 mx-auto text-zinc-300 mb-4" />
			<p class="text-zinc-600 mb-4">No scores yet. Be the first to play!</p>
			<Button.Root onclick={() => goto('/modules/leaderboard')} class="cursor-pointer">
				<Gamepad2 class="w-4 h-4 mr-2" />
				Play Now
			</Button.Root>
		</div>
	{:else}
		<div class="bg-white border border-zinc-200 rounded-lg overflow-hidden">
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head class="w-16">Rank</Table.Head>
						<Table.Head>Player</Table.Head>
						<Table.Head class="text-right">Score</Table.Head>
						<Table.Head class="text-right">Date</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each data.scores as score, index}
						{@const rankStyle = getRankIcon(index)}
						<Table.Row class={rankStyle.bg}>
							<Table.Cell>
								<div class="flex items-center gap-2">
									{#if index < 3}
										<Medal class="w-5 h-5 {rankStyle.color}" />
									{:else}
										<span class="w-5 text-center text-zinc-500">{index + 1}</span>
									{/if}
								</div>
							</Table.Cell>
							<Table.Cell>
								<div class="flex items-center gap-3">
									<div class="w-8 h-8 bg-zinc-100 rounded-full flex items-center justify-center text-sm font-medium">
										{(score.userName?.charAt(0) || score.userEmail?.charAt(0) || '?').toUpperCase()}
									</div>
									<span class="font-medium">{score.userName || score.userEmail || 'Anonymous'}</span>
								</div>
							</Table.Cell>
							<Table.Cell class="text-right">
								<span class="font-bold text-lg {index === 0 ? 'text-yellow-600' : index === 1 ? 'text-zinc-600' : index === 2 ? 'text-amber-700' : 'text-zinc-900'}">
									{parseInt(score.score).toLocaleString()}
								</span>
							</Table.Cell>
							<Table.Cell class="text-right text-zinc-500 text-sm">
								{formatDate(score.createdAt)}
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</div>
	{/if}
</div>
