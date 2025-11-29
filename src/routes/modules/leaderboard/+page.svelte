<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui';
	import { Trophy, Play, RotateCcw } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	let { data } = $props();

	let gameState = $state<'idle' | 'playing' | 'ended'>('idle');
	let score = $state(0);
	let timeLeft = $state(10);
	let clickCount = $state(0);
	let gameInterval = $state<ReturnType<typeof setInterval> | null>(null);

	function startGame() {
		gameState = 'playing';
		score = 0;
		clickCount = 0;
		timeLeft = 10;

		gameInterval = setInterval(() => {
			timeLeft--;
			if (timeLeft <= 0) {
				endGame();
			}
		}, 1000);
	}

	function handleClick() {
		if (gameState === 'playing') {
			clickCount++;
			score = clickCount * 10;
		}
	}

	function endGame() {
		gameState = 'ended';
		if (gameInterval) {
			clearInterval(gameInterval);
			gameInterval = null;
		}
	}

	function resetGame() {
		gameState = 'idle';
		score = 0;
		clickCount = 0;
		timeLeft = 10;
	}
</script>

<svelte:head>
	<title>Click Game - Leaderboard</title>
	<meta name="description" content="Play the click game and compete on the leaderboard" />
</svelte:head>

<div class="max-w-2xl mx-auto px-6 py-16">
	<div class="text-center mb-8">
		<h1 class="text-3xl font-semibold tracking-tight">Click Game</h1>
		<p class="text-zinc-600 mt-2">Click as fast as you can in 10 seconds!</p>
		{#if !data.isLoggedIn}
			<p class="text-amber-600 mt-2 text-sm">Log in to save your scores to the leaderboard</p>
		{/if}
	</div>

	<!-- Game Box -->
	<div class="bg-white border-2 border-zinc-200 rounded-xl p-8 mb-8">
		<!-- Score Display -->
		<div class="flex justify-between items-center mb-6">
			<div class="text-center">
				<p class="text-sm text-zinc-500">Score</p>
				<p class="text-3xl font-bold text-blue-600">{score}</p>
			</div>
			<div class="text-center">
				<p class="text-sm text-zinc-500">Time Left</p>
				<p class="text-3xl font-bold {timeLeft <= 3 ? 'text-red-600' : 'text-zinc-900'}">{timeLeft}s</p>
			</div>
			<div class="text-center">
				<p class="text-sm text-zinc-500">Clicks</p>
				<p class="text-3xl font-bold text-green-600">{clickCount}</p>
			</div>
		</div>

		<!-- Game Area -->
		<div
			class="w-full h-64 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-100 select-none
				{gameState === 'idle' ? 'bg-zinc-100 hover:bg-zinc-200' : ''}
				{gameState === 'playing' ? 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700 active:scale-95' : ''}
				{gameState === 'ended' ? 'bg-green-100' : ''}"
			onclick={handleClick}
			onkeydown={(e) => e.key === ' ' && handleClick()}
			role="button"
			tabindex="0"
		>
			{#if gameState === 'idle'}
				<div class="text-center">
					<Play class="w-16 h-16 mx-auto text-zinc-400 mb-4" />
					<p class="text-zinc-600 font-medium">Click Start to Play</p>
				</div>
			{:else if gameState === 'playing'}
				<div class="text-center text-white">
					<p class="text-6xl font-bold">{clickCount}</p>
					<p class="text-xl mt-2">CLICK!</p>
				</div>
			{:else}
				<div class="text-center">
					<Trophy class="w-16 h-16 mx-auto text-green-600 mb-4" />
					<p class="text-2xl font-bold text-green-800">Game Over!</p>
					<p class="text-4xl font-bold text-green-600 mt-2">{score} points</p>
				</div>
			{/if}
		</div>

		<!-- Controls -->
		<div class="mt-6 flex justify-center gap-4">
			{#if gameState === 'idle'}
				<Button.Root onclick={startGame} size="lg" class="cursor-pointer">
					<Play class="w-5 h-5 mr-2" />
					Start Game
				</Button.Root>
			{:else if gameState === 'ended'}
				<Button.Root onclick={resetGame} variant="outline" class="cursor-pointer">
					<RotateCcw class="w-4 h-4 mr-2" />
					Play Again
				</Button.Root>
				{#if data.isLoggedIn}
					<form
						method="POST"
						action="?/submitScore"
						use:enhance={() => {
							return async ({ result }) => {
								if (result.type === 'success') {
									toast.success(`Score of ${score} saved!`);
								} else if (result.type === 'failure') {
									toast.error((result.data as { error?: string })?.error || 'Failed to save score');
								}
							};
						}}
					>
						<input type="hidden" name="score" value={score} />
						<Button.Root type="submit" class="cursor-pointer">
							<Trophy class="w-4 h-4 mr-2" />
							Save Score
						</Button.Root>
					</form>
				{/if}
			{/if}
		</div>
	</div>

	<!-- Leaderboard Link -->
	<div class="text-center">
		<a href="/modules/leaderboard/scores" class="text-blue-600 hover:underline flex items-center justify-center gap-2">
			<Trophy class="w-4 h-4" />
			View Leaderboard
		</a>
	</div>
</div>
