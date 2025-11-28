<script lang="ts">
	import { Blurb, Services, CalloutNumbered } from '$lib/components/blocks';
	import type { ServiceItem, CalloutNumberedItem } from '$lib/components/blocks';

	const services: ServiceItem[] = [
		{
			icon: '🏠',
			title: 'Landing Pages',
			description: 'Single-page sites that make an impact. Perfect for product launches, event promotions, or capturing leads. We focus on clear messaging and strong calls to action.',
			features: [
				'Responsive design for all devices',
				'Optimized for fast loading',
				'SEO-friendly structure'
			]
		},
		{
			icon: '📚',
			title: 'Multi-Page Websites',
			description: 'Complete websites with multiple pages, navigation, and organized content. Ideal for businesses, portfolios, and organizations that need room to grow.',
			features: [
				'Intuitive navigation structure',
				'Consistent design across pages',
				'Content management ready'
			]
		},
		{
			icon: '📝',
			title: 'Documentation Sites',
			description: 'Clean, searchable documentation that helps users find answers fast. Built for technical teams, open source projects, and API documentation.',
			features: [
				'Easy-to-navigate structure',
				'Code syntax highlighting',
				'Version control friendly'
			]
		},
		{
			icon: '🎨',
			title: 'Portfolio Sites',
			description: 'Showcase your work in style. We create portfolios that let your projects shine while telling your story as a creative professional.',
			features: [
				'Gallery layouts for visual work',
				'Case study templates',
				'Contact integration'
			]
		}
	];

	const process: CalloutNumberedItem[] = [
		{
			title: 'Discovery',
			description: 'We learn about your goals and audience'
		},
		{
			title: 'Design',
			description: 'We create mockups and gather feedback'
		},
		{
			title: 'Build',
			description: 'We develop and test everything'
		},
		{
			title: 'Launch',
			description: 'We deploy and provide support'
		}
	];
</script>

<svelte:head>
	<title>Services - SSR Site</title>
	<meta name="description" content="Web development services from SSR Site" />
</svelte:head>

<div class="max-w-4xl mx-auto px-6 py-16">
	<Blurb
		title="Our Services"
		description="From simple landing pages to complete multi-page websites, we build digital experiences that work."
	/>

	<Services {services} />

	<CalloutNumbered title="How We Work" items={process} />
</div>
