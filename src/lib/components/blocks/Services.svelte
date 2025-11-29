<script lang="ts">
	export interface ServiceItem {
		icon: string;
		title: string;
		description: string;
		features: string[];
	}

	interface Props {
		services: ServiceItem[];
	}

	let { services }: Props = $props();
</script>

<div class="grid gap-8 mb-16">
	{#each services as service}
		<div class="border rounded-2xl p-8 hover:border-zinc-400 transition-colors">
			<div class="flex items-start gap-6">
				<div class="text-4xl">{service.icon}</div>
				<div class="flex-1">
					<h2 class="text-xl font-semibold mb-2">{service.title}</h2>
					<p class="text-zinc-600 dark:text-zinc-400 mb-4">{service.description}</p>
					<ul class="text-sm text-zinc-500 dark:text-zinc-400 space-y-1">
						{#each service.features as feature}
							<li>• {feature}</li>
						{/each}
					</ul>
				</div>
			</div>
		</div>
	{/each}
</div>
