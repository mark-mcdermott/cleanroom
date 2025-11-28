<svelte:head>
	<title>Contact - Static Site</title>
	<meta name="description" content="Get in touch with the Static Site team" />
</svelte:head>

<div class="max-w-4xl mx-auto px-6 py-16">
	<h1 class="text-4xl font-semibold tracking-tight mb-4">Contact Us</h1>
	<p class="text-zinc-600 text-lg mb-12">
		Have a project in mind? We'd love to hear from you. Drop us a message and we'll get back to you within 24 hours.
	</p>

	<div class="grid md:grid-cols-2 gap-12">
		<!-- Contact Form -->
		<div>
			<h2 class="text-xl font-semibold mb-6">Send a Message</h2>
			<form class="space-y-6">
				<div>
					<label for="name" class="block text-sm font-medium text-zinc-700 mb-2">Name</label>
					<input
						type="text"
						id="name"
						name="name"
						class="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-shadow"
						placeholder="Your name"
					/>
				</div>
				<div>
					<label for="email" class="block text-sm font-medium text-zinc-700 mb-2">Email</label>
					<input
						type="email"
						id="email"
						name="email"
						class="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-shadow"
						placeholder="you@example.com"
					/>
				</div>
				<div>
					<label for="subject" class="block text-sm font-medium text-zinc-700 mb-2">Subject</label>
					<select
						id="subject"
						name="subject"
						class="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-shadow bg-white"
					>
						<option value="">Select a topic...</option>
						<option value="project">New Project</option>
						<option value="quote">Request a Quote</option>
						<option value="support">Support</option>
						<option value="other">Other</option>
					</select>
				</div>
				<div>
					<label for="message" class="block text-sm font-medium text-zinc-700 mb-2">Message</label>
					<textarea
						id="message"
						name="message"
						rows="5"
						class="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-shadow resize-none"
						placeholder="Tell us about your project..."
					></textarea>
				</div>
				<button
					type="submit"
					class="w-full px-6 py-3 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors font-medium"
				>
					Send Message
				</button>
			</form>
			<p class="text-xs text-zinc-500 mt-4">
				This is a demo form. In a real site, this would submit to your backend or email service.
			</p>
		</div>

		<!-- Contact Info -->
		<div>
			<h2 class="text-xl font-semibold mb-6">Other Ways to Reach Us</h2>

			<div class="space-y-6">
				<div class="flex gap-4">
					<div class="text-2xl">📧</div>
					<div>
						<h3 class="font-medium mb-1">Email</h3>
						<p class="text-zinc-600">hello@staticsite.example</p>
					</div>
				</div>

				<div class="flex gap-4">
					<div class="text-2xl">📍</div>
					<div>
						<h3 class="font-medium mb-1">Location</h3>
						<p class="text-zinc-600">
							The Burrow, Eucalyptus Grove<br />
							Australian Outback, AU 0000
						</p>
					</div>
				</div>

				<div class="flex gap-4">
					<div class="text-2xl">🕐</div>
					<div>
						<h3 class="font-medium mb-1">Hours</h3>
						<p class="text-zinc-600">
							Monday - Friday: 9am - 5pm AEST<br />
							Weekends: Emergency support only
						</p>
					</div>
				</div>
			</div>

			<!-- FAQ -->
			<div class="mt-10 bg-zinc-50 rounded-2xl p-6">
				<h3 class="font-semibold mb-4">Frequently Asked</h3>
				<div class="space-y-4 text-sm">
					<div>
						<p class="font-medium text-zinc-900">How long does a project take?</p>
						<p class="text-zinc-600">Most projects take 2-6 weeks depending on complexity.</p>
					</div>
					<div>
						<p class="font-medium text-zinc-900">Do you offer maintenance?</p>
						<p class="text-zinc-600">Yes! We offer ongoing support and maintenance plans.</p>
					</div>
					<div>
						<p class="font-medium text-zinc-900">What's your process?</p>
						<p class="text-zinc-600">Check out our <a href="/sites/static-site/services" class="underline hover:text-zinc-900">Services page</a> to learn more.</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
