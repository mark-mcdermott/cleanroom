import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { ProjectConfig, FeatureModule } from '../../types';

// ============================================================================
// VIDEOS PAGE COMPONENT
// ============================================================================

function getVideosPage(): string {
	return `<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { Globe, Play, MapPin, Filter, X, Star, Clock, Eye } from 'lucide-svelte';

	// Types
	interface Location {
		name: string;
		country: string;
		lat: number;
		lng: number;
		type: 'city' | 'attraction';
	}

	interface Video {
		id: string;
		title: string;
		thumbnail: string;
		duration: string;
		views: string;
		location: string;
		country: string;
		tags: string[];
		quality: 'high' | 'featured';
		creator: string;
	}

	// State
	let selectedLocation = $state<string | null>(null);
	let selectedTags = $state<string[]>([]);
	let canvasElement = $state<HTMLCanvasElement | null>(null);
	let globeInstance: any = null;
	let phi = $state(0);
	let isDragging = $state(false);
	let pointerX = $state(0);

	// All available tags
	const allTags = [
		{ id: 'food', label: 'Food & Cuisine', color: 'bg-orange-500' },
		{ id: 'culture', label: 'Culture', color: 'bg-purple-500' },
		{ id: 'travel', label: 'Travel', color: 'bg-blue-500' },
		{ id: 'daily-life', label: 'Daily Life', color: 'bg-green-500' },
		{ id: 'documentary', label: 'Documentary', color: 'bg-red-500' },
		{ id: 'relaxing', label: 'Relaxing', color: 'bg-cyan-500' },
		{ id: 'vlog', label: 'Personal Vlog', color: 'bg-pink-500' },
		{ id: 'attraction', label: 'Tourist Attraction', color: 'bg-yellow-500' }
	];

	// Locations with coordinates
	const locations: Location[] = [
		{ name: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522, type: 'city' },
		{ name: 'Eiffel Tower', country: 'France', lat: 48.8584, lng: 2.2945, type: 'attraction' },
		{ name: 'Tokyo', country: 'Japan', lat: 35.6762, lng: 139.6503, type: 'city' },
		{ name: 'Mount Fuji', country: 'Japan', lat: 35.3606, lng: 138.7274, type: 'attraction' },
		{ name: 'New York', country: 'USA', lat: 40.7128, lng: -74.006, type: 'city' },
		{ name: 'Statue of Liberty', country: 'USA', lat: 40.6892, lng: -74.0445, type: 'attraction' },
		{ name: 'Rome', country: 'Italy', lat: 41.9028, lng: 12.4964, type: 'city' },
		{ name: 'Colosseum', country: 'Italy', lat: 41.8902, lng: 12.4922, type: 'attraction' },
		{ name: 'Sydney', country: 'Australia', lat: -33.8688, lng: 151.2093, type: 'city' },
		{ name: 'Cairo', country: 'Egypt', lat: 30.0444, lng: 31.2357, type: 'city' },
		{ name: 'Pyramids of Giza', country: 'Egypt', lat: 29.9792, lng: 31.1342, type: 'attraction' },
		{ name: 'Rio de Janeiro', country: 'Brazil', lat: -22.9068, lng: -43.1729, type: 'city' },
		{ name: 'Bangkok', country: 'Thailand', lat: 13.7563, lng: 100.5018, type: 'city' },
		{ name: 'Machu Picchu', country: 'Peru', lat: -13.1631, lng: -72.545, type: 'attraction' },
		{ name: 'Santorini', country: 'Greece', lat: 36.3932, lng: 25.4615, type: 'city' },
		{ name: 'Bali', country: 'Indonesia', lat: -8.4095, lng: 115.1889, type: 'city' }
	];

	// Mock video data - replace with your API data
	const videos: Video[] = [
		{
			id: '1',
			title: 'Sunrise at the Eiffel Tower - 4K Cinematic',
			thumbnail: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce65f4?w=400&h=225&fit=crop',
			duration: '12:34',
			views: '2.4M',
			location: 'Eiffel Tower',
			country: 'France',
			tags: ['relaxing', 'attraction', 'documentary'],
			quality: 'featured',
			creator: 'Wanderlust Films'
		},
		{
			id: '2',
			title: 'Street Food Tour in Tokyo',
			thumbnail: 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=400&h=225&fit=crop',
			duration: '24:15',
			views: '1.8M',
			location: 'Tokyo',
			country: 'Japan',
			tags: ['food', 'culture', 'vlog'],
			quality: 'high',
			creator: 'Food Explorer'
		},
		{
			id: '3',
			title: 'A Day in the Life: NYC',
			thumbnail: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&h=225&fit=crop',
			duration: '18:42',
			views: '956K',
			location: 'New York',
			country: 'USA',
			tags: ['daily-life', 'culture', 'vlog'],
			quality: 'high',
			creator: 'City Vibes'
		},
		{
			id: '4',
			title: 'Ancient Rome: Colosseum Documentary',
			thumbnail: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400&h=225&fit=crop',
			duration: '45:20',
			views: '3.2M',
			location: 'Colosseum',
			country: 'Italy',
			tags: ['documentary', 'attraction', 'culture'],
			quality: 'featured',
			creator: 'History Channel'
		},
		{
			id: '5',
			title: 'Relaxing Walk Through Kyoto Gardens',
			thumbnail: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&h=225&fit=crop',
			duration: '1:02:15',
			views: '4.1M',
			location: 'Tokyo',
			country: 'Japan',
			tags: ['relaxing', 'culture'],
			quality: 'featured',
			creator: 'Calm Travels'
		},
		{
			id: '6',
			title: 'Exploring the Pyramids of Giza',
			thumbnail: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?w=400&h=225&fit=crop',
			duration: '32:45',
			views: '2.9M',
			location: 'Pyramids of Giza',
			country: 'Egypt',
			tags: ['documentary', 'attraction', 'travel'],
			quality: 'featured',
			creator: 'Ancient Wonders'
		},
		{
			id: '7',
			title: 'Brazilian Street Food in Rio',
			thumbnail: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=400&h=225&fit=crop',
			duration: '19:22',
			views: '1.2M',
			location: 'Rio de Janeiro',
			country: 'Brazil',
			tags: ['food', 'culture', 'vlog'],
			quality: 'high',
			creator: 'Taste the World'
		},
		{
			id: '8',
			title: 'Santorini Sunset - 4K Ambient',
			thumbnail: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=400&h=225&fit=crop',
			duration: '45:00',
			views: '5.2M',
			location: 'Santorini',
			country: 'Greece',
			tags: ['relaxing'],
			quality: 'featured',
			creator: 'Relax Worlds'
		}
	];

	// Filtered videos based on selection
	const filteredVideos = $derived(() => {
		let result = videos;

		if (selectedLocation) {
			result = result.filter(
				(v) => v.location === selectedLocation || v.country === selectedLocation
			);
		}

		if (selectedTags.length > 0) {
			result = result.filter((v) => selectedTags.some((tag) => v.tags.includes(tag)));
		}

		return result;
	});

	// Toggle tag selection
	function toggleTag(tagId: string) {
		if (selectedTags.includes(tagId)) {
			selectedTags = selectedTags.filter((t) => t !== tagId);
		} else {
			selectedTags = [...selectedTags, tagId];
		}
	}

	// Select location from globe or list
	function selectLocation(locationName: string | null) {
		selectedLocation = locationName;
	}

	// Clear all filters
	function clearFilters() {
		selectedLocation = null;
		selectedTags = [];
	}

	// Convert lat/lng to phi/theta for globe rotation
	function focusOnLocation(lat: number, lng: number) {
		const targetPhi = ((90 - lng) * Math.PI) / 180;
		phi = targetPhi;
	}

	// Initialize globe
	onMount(async () => {
		if (!canvasElement) return;

		try {
			const createGlobe = (await import('cobe')).default;

			const markers = locations.map((loc) => ({
				location: [loc.lat, loc.lng] as [number, number],
				size: loc.type === 'attraction' ? 0.08 : 0.05
			}));

			globeInstance = createGlobe(canvasElement, {
				devicePixelRatio: 2,
				width: 600 * 2,
				height: 600 * 2,
				phi: 0,
				theta: 0.3,
				dark: 1,
				diffuse: 1.2,
				mapSamples: 16000,
				mapBrightness: 6,
				baseColor: [0.3, 0.3, 0.3],
				markerColor: [0.4, 0.7, 1],
				glowColor: [0.2, 0.2, 0.4],
				markers,
				onRender: (state: any) => {
					if (!isDragging) {
						phi += 0.003;
					}
					state.phi = phi;
				}
			});
		} catch (e) {
			console.log('Globe requires cobe package');
		}
	});

	onDestroy(() => {
		if (globeInstance) {
			globeInstance.destroy();
		}
	});

	function handlePointerDown(e: PointerEvent) {
		isDragging = true;
		pointerX = e.clientX;
	}

	function handlePointerMove(e: PointerEvent) {
		if (isDragging) {
			const delta = e.clientX - pointerX;
			pointerX = e.clientX;
			phi += delta * 0.005;
		}
	}

	function handlePointerUp() {
		isDragging = false;
	}
</script>

<svelte:head>
	<title>Travel Videos - Explore the World</title>
	<meta name="description" content="Discover travel videos from around the world" />
</svelte:head>

<div class="min-h-screen bg-background text-foreground">
	<div class="border-b border-border bg-secondary/50 backdrop-blur-sm sticky top-0 z-10">
		<div class="max-w-7xl mx-auto px-6 py-4">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-3">
					<Globe class="w-8 h-8 text-blue-400" />
					<h1 class="text-2xl font-semibold">Travel Videos</h1>
				</div>
				{#if selectedLocation || selectedTags.length > 0}
					<button
						onclick={clearFilters}
						class="flex items-center gap-2 px-3 py-1.5 text-sm bg-secondary hover:bg-accent rounded-full transition-colors cursor-pointer"
					>
						<X class="w-4 h-4" />
						Clear filters
					</button>
				{/if}
			</div>
		</div>
	</div>

	<div class="max-w-7xl mx-auto px-6 py-8">
		<div class="grid lg:grid-cols-[400px_1fr] gap-8">
			<div class="space-y-6">
				<div class="bg-secondary rounded-2xl p-4 border border-border">
					<h2 class="text-lg font-medium mb-4 flex items-center gap-2">
						<MapPin class="w-5 h-5 text-blue-400" />
						Explore the Globe
					</h2>
					<div
						class="relative aspect-square rounded-xl overflow-hidden bg-primary cursor-grab active:cursor-grabbing"
						onpointerdown={handlePointerDown}
						onpointermove={handlePointerMove}
						onpointerup={handlePointerUp}
						onpointerleave={handlePointerUp}
						role="application"
						aria-label="Interactive globe - drag to rotate"
					>
						<canvas
							bind:this={canvasElement}
							class="w-full h-full"
							width="1200"
							height="1200"
							style="width: 100%; height: 100%;"
						></canvas>
						<div class="absolute bottom-3 left-3 right-3 text-center">
							<p class="text-xs text-muted-foreground">Drag to rotate</p>
						</div>
					</div>
				</div>

				<div class="bg-secondary rounded-2xl p-4 border border-border">
					<h2 class="text-lg font-medium mb-4">Destinations</h2>
					<div class="space-y-2 max-h-64 overflow-y-auto">
						{#each locations as location}
							<button
								onclick={() => {
									selectLocation(location.name);
									focusOnLocation(location.lat, location.lng);
								}}
								class="w-full text-left px-3 py-2 rounded-lg flex items-center justify-between transition-colors cursor-pointer {selectedLocation === location.name ? 'bg-blue-600 text-white' : 'bg-muted hover:bg-accent text-muted-foreground'}"
							>
								<span class="flex items-center gap-2">
									{#if location.type === 'attraction'}
										<Star class="w-4 h-4 text-yellow-400" />
									{:else}
										<MapPin class="w-4 h-4 text-blue-400" />
									{/if}
									{location.name}
								</span>
								<span class="text-xs text-muted-foreground">{location.country}</span>
							</button>
						{/each}
					</div>
				</div>

				<div class="bg-secondary rounded-2xl p-4 border border-border">
					<h2 class="text-lg font-medium mb-4 flex items-center gap-2">
						<Filter class="w-5 h-5 text-blue-400" />
						Filter by Category
					</h2>
					<div class="flex flex-wrap gap-2">
						{#each allTags as tag}
							<button
								onclick={() => toggleTag(tag.id)}
								class="px-3 py-1.5 rounded-full text-sm transition-all cursor-pointer {selectedTags.includes(tag.id) ? tag.color + ' text-white' : 'bg-muted text-muted-foreground hover:bg-accent'}"
							>
								{tag.label}
							</button>
						{/each}
					</div>
				</div>
			</div>

			<div>
				<div class="flex items-center justify-between mb-6">
					<h2 class="text-xl font-semibold">
						{#if selectedLocation}
							Videos from {selectedLocation}
						{:else}
							All Videos
						{/if}
						<span class="text-muted-foreground font-normal text-base ml-2">
							({filteredVideos().length} videos)
						</span>
					</h2>
				</div>

				{#if filteredVideos().length === 0}
					<div class="text-center py-16 bg-secondary rounded-2xl border border-border">
						<Globe class="w-16 h-16 text-muted-foreground mx-auto mb-4" />
						<p class="text-muted-foreground">No videos match your filters</p>
						<button
							onclick={clearFilters}
							class="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
						>
							Clear filters
						</button>
					</div>
				{:else}
					<div class="grid sm:grid-cols-2 gap-4">
						{#each filteredVideos() as video}
							<div class="group bg-secondary rounded-xl overflow-hidden border border-border hover:border-accent transition-colors cursor-pointer">
								<div class="relative aspect-video">
									<img
										src={video.thumbnail}
										alt={video.title}
										class="w-full h-full object-cover"
									/>
									<div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
										<div class="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
											<Play class="w-8 h-8 text-white fill-white" />
										</div>
									</div>
									<div class="absolute bottom-2 right-2 bg-black/80 px-2 py-0.5 rounded text-xs">
										{video.duration}
									</div>
									{#if video.quality === 'featured'}
										<div class="absolute top-2 left-2 bg-yellow-500 text-black px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1">
											<Star class="w-3 h-3" />
											Featured
										</div>
									{/if}
								</div>
								<div class="p-4">
									<h3 class="font-medium text-sm line-clamp-2 mb-2 group-hover:text-blue-400 transition-colors">
										{video.title}
									</h3>
									<p class="text-xs text-muted-foreground mb-2">{video.creator}</p>
									<div class="flex items-center gap-3 text-xs text-muted-foreground mb-3">
										<span class="flex items-center gap-1">
											<Eye class="w-3 h-3" />
											{video.views}
										</span>
										<span class="flex items-center gap-1">
											<MapPin class="w-3 h-3" />
											{video.location}
										</span>
									</div>
									<div class="flex flex-wrap gap-1">
										{#each video.tags.slice(0, 3) as tag}
											{@const tagInfo = allTags.find(t => t.id === tag)}
											<span class="px-2 py-0.5 rounded text-xs {tagInfo?.color || 'bg-muted'} text-white">
												{tagInfo?.label || tag}
											</span>
										{/each}
									</div>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>
`;
}

// ============================================================================
// MAIN MODULE EXPORT
// ============================================================================

export const videosModule: FeatureModule = {
	name: 'videos',
	async apply(config: ProjectConfig, outputDir: string) {
		console.log('  → Adding travel videos module with interactive globe');

		// Create videos route directory
		await mkdir(join(outputDir, 'src', 'routes', 'videos'), { recursive: true });

		// Write videos page
		await writeFile(
			join(outputDir, 'src', 'routes', 'videos', '+page.svelte'),
			getVideosPage()
		);

		// Add dependencies
		const packageJsonPath = join(outputDir, 'package.json');
		try {
			const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf-8'));

			packageJson.dependencies = {
				...packageJson.dependencies,
				cobe: '^0.6.3',
				'lucide-svelte': '^0.468.0'
			};

			await writeFile(packageJsonPath, JSON.stringify(packageJson, null, '\t'));
		} catch {
			// Package.json doesn't exist, skip
		}

		console.log('  → Travel videos module created successfully');
		console.log('  → Interactive globe with cobe library');
		console.log('  → Connect to your video API to replace mock data');
	}
};
