import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { ProjectConfig, FeatureModule } from '../../types';

// ============================================================================
// LOBBY PAGE COMPONENT
// ============================================================================

function getLobbyPage(): string {
	return `<script lang="ts">
	import { Video, MessageCircle, Mic, MicOff, Camera, CameraOff, PhoneOff, Users, Sparkles, Send } from 'lucide-svelte';
	import { Button } from '$lib/components/ui';

	// Demo state (in real app, this comes from Daily.co)
	let isMuted = $state(false);
	let isVideoOff = $state(false);
	let isChatOpen = $state(true);
	let isInRoom = $state(false);
	let userName = $state('');
	let chatMessage = $state('');

	// Mock participants for demo
	const mockParticipants = [
		{ id: '1', name: 'Sarah', isMuted: false, isVideoOn: true },
		{ id: '2', name: 'Michael', isMuted: true, isVideoOn: true },
		{ id: '3', name: 'Emma', isMuted: false, isVideoOn: false },
		{ id: '4', name: 'James', isMuted: false, isVideoOn: true }
	];

	// Mock chat messages
	let chatMessages = $state([
		{ name: 'Sarah', text: 'Namaste everyone', time: '2:30 PM' },
		{ name: 'Michael', text: 'Ready for today\\'s session', time: '2:31 PM' },
		{ name: 'Emma', text: 'So peaceful here', time: '2:32 PM' }
	]);

	function joinRoom() {
		if (userName.trim()) {
			isInRoom = true;
		}
	}

	function leaveRoom() {
		isInRoom = false;
		userName = '';
	}

	function sendMessage() {
		if (chatMessage.trim()) {
			chatMessages = [...chatMessages, { name: 'You', text: chatMessage, time: 'Now' }];
			chatMessage = '';
		}
	}

	function getInitials(name: string) {
		return name.split(' ').map(n => n[0]).join('').toUpperCase();
	}
</script>

<svelte:head>
	<title>Meditation Lobby</title>
	<meta name="description" content="Video room for group meditation sessions" />
</svelte:head>

<div class="max-w-6xl mx-auto px-6 py-12">
	<div class="text-center mb-8">
		<div class="flex items-center justify-center gap-3 mb-4">
			<Sparkles class="w-10 h-10 text-purple-600" />
			<h1 class="text-3xl font-semibold tracking-tight">Meditation Lobby</h1>
		</div>
		<p class="text-muted-foreground">
			A peaceful space for group meditation with video and chat
		</p>
	</div>

	{#if !isInRoom}
		<!-- Join Room Form -->
		<div class="max-w-md mx-auto">
			<div class="bg-card border border-border rounded-xl p-8 shadow-sm">
				<div class="text-center mb-6">
					<div class="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
						<Users class="w-8 h-8 text-purple-600" />
					</div>
					<h2 class="text-xl font-semibold">Join the Lobby</h2>
					<p class="text-sm text-muted-foreground mt-2">
						Enter your name to join the meditation session
					</p>
				</div>

				<form onsubmit={(e) => { e.preventDefault(); joinRoom(); }} class="space-y-4">
					<div>
						<label for="name" class="block text-sm font-medium text-muted-foreground mb-2">
							Your Name
						</label>
						<input
							type="text"
							id="name"
							bind:value={userName}
							placeholder="Enter your name"
							class="w-full px-4 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500"
						/>
					</div>
					<Button.Root type="submit" class="w-full cursor-pointer bg-purple-600 hover:bg-purple-700">
						<Video class="w-4 h-4 mr-2" />
						Join Session
					</Button.Root>
				</form>

				<div class="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
					<p class="text-sm text-amber-800 dark:text-amber-200">
						<strong>Note:</strong> This is a demo UI. Add your
						<a href="https://daily.co" target="_blank" class="underline">Daily.co</a> API key to enable real video calls.
					</p>
				</div>
			</div>
		</div>
	{:else}
		<!-- Video Room -->
		<div class="flex gap-4 h-[600px]">
			<!-- Main Video Area -->
			<div class="flex-1 flex flex-col">
				<!-- Video Grid -->
				<div class="flex-1 bg-primary rounded-xl p-4 grid grid-cols-2 gap-3">
					{#each mockParticipants as participant}
						<div class="relative bg-secondary rounded-lg overflow-hidden flex items-center justify-center">
							{#if participant.isVideoOn}
								<div class="absolute inset-0 bg-gradient-to-br from-purple-900/50 to-zinc-900"></div>
								<div class="relative z-10 w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-semibold">
									{getInitials(participant.name)}
								</div>
							{:else}
								<div class="w-20 h-20 bg-muted rounded-full flex items-center justify-center text-white text-2xl font-semibold">
									{getInitials(participant.name)}
								</div>
							{/if}
							<div class="absolute bottom-3 left-3 flex items-center gap-2">
								<span class="bg-black/50 text-white text-sm px-2 py-1 rounded">
									{participant.name}
								</span>
								{#if participant.isMuted}
									<span class="bg-red-500/80 p-1 rounded">
										<MicOff class="w-3 h-3 text-white" />
									</span>
								{/if}
							</div>
						</div>
					{/each}
				</div>

				<!-- Controls -->
				<div class="flex items-center justify-center gap-3 mt-4">
					<button
						onclick={() => isMuted = !isMuted}
						class="w-12 h-12 rounded-full flex items-center justify-center transition-colors cursor-pointer {isMuted ? 'bg-red-500 text-white' : 'bg-muted text-muted-foreground hover:bg-accent'}"
					>
						{#if isMuted}
							<MicOff class="w-5 h-5" />
						{:else}
							<Mic class="w-5 h-5" />
						{/if}
					</button>
					<button
						onclick={() => isVideoOff = !isVideoOff}
						class="w-12 h-12 rounded-full flex items-center justify-center transition-colors cursor-pointer {isVideoOff ? 'bg-red-500 text-white' : 'bg-muted text-muted-foreground hover:bg-accent'}"
					>
						{#if isVideoOff}
							<CameraOff class="w-5 h-5" />
						{:else}
							<Camera class="w-5 h-5" />
						{/if}
					</button>
					<button
						onclick={leaveRoom}
						class="w-12 h-12 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors cursor-pointer"
					>
						<PhoneOff class="w-5 h-5" />
					</button>
					<button
						onclick={() => isChatOpen = !isChatOpen}
						class="w-12 h-12 rounded-full flex items-center justify-center transition-colors cursor-pointer {isChatOpen ? 'bg-purple-500 text-white' : 'bg-muted text-muted-foreground hover:bg-accent'}"
					>
						<MessageCircle class="w-5 h-5" />
					</button>
				</div>
			</div>

			<!-- Chat Sidebar -->
			{#if isChatOpen}
				<div class="w-80 bg-card border border-border rounded-xl flex flex-col">
					<div class="p-4 border-b border-border">
						<h3 class="font-semibold flex items-center gap-2">
							<MessageCircle class="w-4 h-4" />
							Chat
						</h3>
					</div>

					<div class="flex-1 overflow-y-auto p-4 space-y-3">
						{#each chatMessages as msg}
							<div class="text-sm">
								<div class="flex items-baseline gap-2">
									<span class="font-medium text-purple-600 dark:text-purple-400">{msg.name}</span>
									<span class="text-xs text-muted-foreground">{msg.time}</span>
								</div>
								<p class="text-muted-foreground mt-0.5">{msg.text}</p>
							</div>
						{/each}
					</div>

					<div class="p-3 border-t border-border">
						<form onsubmit={(e) => { e.preventDefault(); sendMessage(); }} class="flex gap-2">
							<input
								type="text"
								bind:value={chatMessage}
								placeholder="Send a message..."
								class="flex-1 px-3 py-2 text-sm border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500"
							/>
							<button
								type="submit"
								class="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors cursor-pointer"
							>
								<Send class="w-4 h-4" />
							</button>
						</form>
					</div>
				</div>
			{/if}
		</div>

		<!-- Participant count -->
		<div class="text-center mt-4">
			<span class="inline-flex items-center gap-2 text-sm text-muted-foreground">
				<Users class="w-4 h-4" />
				{mockParticipants.length} meditators in session
			</span>
		</div>
	{/if}

	<!-- Setup Instructions -->
	<div class="mt-12 max-w-2xl mx-auto">
		<h2 class="text-xl font-semibold mb-4">Setup Instructions</h2>
		<div class="space-y-4 text-sm text-muted-foreground">
			<p>To enable real video calls, you'll need to:</p>
			<ol class="list-decimal list-inside space-y-2 ml-4">
				<li>Create a free account at <a href="https://daily.co" target="_blank" class="text-purple-600 dark:text-purple-400 underline">daily.co</a></li>
				<li>Get your API key from the Daily dashboard</li>
				<li>Add <code class="bg-muted px-1 rounded">DAILY_API_KEY</code> to your <code class="bg-muted px-1 rounded">.env</code> file</li>
				<li>Optionally set <code class="bg-muted px-1 rounded">DAILY_DOMAIN</code> for custom domains</li>
			</ol>
			<p class="mt-4">
				The module uses <code class="bg-muted px-1 rounded">@daily-co/daily-js</code> for video
				and chat functionality, with a peaceful meditation-focused UI.
			</p>
		</div>
	</div>
</div>
`;
}

// ============================================================================
// MAIN MODULE EXPORT
// ============================================================================

export const lobbyModule: FeatureModule = {
	name: 'lobby',
	async apply(config: ProjectConfig, outputDir: string) {
		console.log('  → Adding lobby video room module');

		// Create lobby route directory
		await mkdir(join(outputDir, 'src', 'routes', 'lobby'), { recursive: true });

		// Write lobby page
		await writeFile(
			join(outputDir, 'src', 'routes', 'lobby', '+page.svelte'),
			getLobbyPage()
		);

		// Add @daily-co/daily-js dependency
		const packageJsonPath = join(outputDir, 'package.json');
		try {
			const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf-8'));

			packageJson.dependencies = {
				...packageJson.dependencies,
				'@daily-co/daily-js': '^0.77.0',
				'lucide-svelte': '^0.468.0'
			};

			await writeFile(packageJsonPath, JSON.stringify(packageJson, null, '\t'));
		} catch {
			// Package.json doesn't exist, skip
		}

		console.log('  → Lobby video room module created successfully');
		console.log('  → Add DAILY_API_KEY to .env to enable video calls');
	}
};
