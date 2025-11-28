<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { Input, Email, Select, Textarea, Button } from '$lib/components/forms';
	import { EmojiList, CalloutFAQ } from '$lib/components/blocks';
	import type { SelectOption } from '$lib/components/forms';
	import type { EmojiListItem, FAQItem } from '$lib/components/blocks';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const { form, errors, enhance, message } = superForm(data.form);

	const subjectOptions: SelectOption[] = [
		{ value: 'project', label: 'New Project' },
		{ value: 'quote', label: 'Request a Quote' },
		{ value: 'support', label: 'Support' },
		{ value: 'other', label: 'Other' }
	];

	const contactInfo: EmojiListItem[] = [
		{
			icon: '📧',
			title: 'Email',
			description: 'hello@ssrsite.example'
		},
		{
			icon: '📍',
			title: 'Location',
			description: 'The Burrow, Eucalyptus Grove<br />Australian Outback, AU 0000'
		},
		{
			icon: '🕐',
			title: 'Hours',
			description: 'Monday - Friday: 9am - 5pm AEST<br />Weekends: Emergency support only'
		}
	];

	const faqItems: FAQItem[] = [
		{
			question: 'How long does a project take?',
			answer: 'Most projects take 2-6 weeks depending on complexity.'
		},
		{
			question: 'Do you offer maintenance?',
			answer: 'Yes! We offer ongoing support and maintenance plans.'
		},
		{
			question: "What's your process?",
			answer:
				'Check out our <a href="/sites/ssr-site/services" class="underline hover:text-zinc-900">Services page</a> to learn more.'
		}
	];
</script>

<svelte:head>
	<title>Contact - SSR Site</title>
	<meta name="description" content="Get in touch with the SSR Site team" />
</svelte:head>

<div class="max-w-4xl mx-auto px-6 py-16">
	<h1 class="text-4xl font-semibold tracking-tight mb-4">Contact Us</h1>
	<p class="text-zinc-600 text-lg mb-12">
		Have a project in mind? We'd love to hear from you. Drop us a message and we'll get back to you
		within 24 hours.
	</p>

	<div class="grid md:grid-cols-2 gap-12">
		<!-- Contact Form -->
		<div>
			<h2 class="text-xl font-semibold mt-0 mb-6">Send a Message</h2>

			{#if $message}
				<div
					class="mb-6 p-4 rounded-lg {$message === 'Message sent successfully!'
						? 'bg-green-50 text-green-800'
						: 'bg-red-50 text-red-800'}"
				>
					{$message}
				</div>
			{/if}

			<form method="POST" use:enhance class="space-y-6">
				<Input
					name="name"
					label="Name"
					placeholder="Your name"
					bind:value={$form.name}
					error={$errors.name}
				/>

				<Email name="email" label="Email" bind:value={$form.email} error={$errors.email} />

				<Select
					name="subject"
					label="Subject"
					options={subjectOptions}
					placeholder="Select a topic..."
					bind:value={$form.subject}
					error={$errors.subject}
				/>

				<Textarea
					name="message"
					label="Message"
					placeholder="Tell us about your project..."
					bind:value={$form.message}
					error={$errors.message}
				/>

				<Button type="submit">Send Message</Button>
			</form>
			<p class="text-xs text-zinc-500 mt-4">
				This is a demo form. In a real site, this would submit to your backend or email service.
			</p>
		</div>

		<!-- Contact Info -->
		<div>
			<EmojiList title="Other Ways to Reach Us" items={contactInfo} />

			<div class="mt-10">
				<CalloutFAQ title="Frequently Asked" items={faqItems} />
			</div>
		</div>
	</div>
</div>
