<script lang="ts">
	import { Alert, Button, Card, DropdownMenu, Label, PostCard, Prose, Sheet, Table } from '$lib/components/ui';
	import {
		Input as FormInput,
		Email as FormEmail,
		Select as FormSelect,
		Textarea as FormTextarea,
		Button as FormButton,
		Checkbox as FormCheckbox,
		RadioGroup as FormRadioGroup,
		Switch as FormSwitch
	} from '$lib/components/forms';
	import type { SelectOption, RadioOption } from '$lib/components/forms';
	import { AlertCircle, ChevronDown, Menu } from 'lucide-svelte';

	let sheetOpen = $state(false);

	// Form component state
	let formInputValue = $state('');
	let formEmailValue = $state('');
	let formSelectValue = $state('');
	let formTextareaValue = $state('');
	let formCheckboxChecked = $state(false);
	let formRadioValue = $state('option1');
	let formSwitchChecked = $state(false);

	const formSelectOptions: SelectOption[] = [
		{ value: 'option1', label: 'Option 1' },
		{ value: 'option2', label: 'Option 2' },
		{ value: 'option3', label: 'Option 3' }
	];

	const formRadioOptions: RadioOption[] = [
		{ value: 'option1', label: 'Option 1' },
		{ value: 'option2', label: 'Option 2' },
		{ value: 'option3', label: 'Option 3' }
	];
</script>

<svelte:head>
	<title>Components - cleanroom</title>
	<meta name="description" content="cleanroom UI Components" />
</svelte:head>

<div class="max-w-4xl mx-auto px-6 py-12">
	<h1 class="mb-2">Components</h1>
	<p class="text-zinc-600 text-lg mb-12">
		A collection of accessible, reusable UI components built with Svelte 5 and bits-ui.
	</p>

	<!-- Alert -->
	<section class="mb-12">
		<h2>Alert</h2>
		<div class="space-y-4">
			<Alert.Root>
				<AlertCircle class="h-4 w-4" />
				<Alert.Title>Default Alert</Alert.Title>
				<Alert.Description>This is a default alert message.</Alert.Description>
			</Alert.Root>

			<Alert.Root variant="destructive">
				<AlertCircle class="h-4 w-4" />
				<Alert.Title>Destructive Alert</Alert.Title>
				<Alert.Description>Something went wrong!</Alert.Description>
			</Alert.Root>
		</div>
	</section>

	<!-- Button -->
	<section class="mb-12">
		<h2>Button</h2>
		<div class="flex flex-wrap gap-4">
			<Button.Root>Default</Button.Root>
			<Button.Root variant="secondary">Secondary</Button.Root>
			<Button.Root variant="destructive">Destructive</Button.Root>
			<Button.Root variant="outline">Outline</Button.Root>
			<Button.Root variant="ghost">Ghost</Button.Root>
			<Button.Root variant="link">Link</Button.Root>
		</div>
		<div class="flex flex-wrap gap-4 mt-4">
			<Button.Root size="sm">Small</Button.Root>
			<Button.Root size="default">Default</Button.Root>
			<Button.Root size="lg">Large</Button.Root>
			<Button.Root size="icon"><Menu class="h-4 w-4" /></Button.Root>
		</div>
	</section>

	<!-- Card -->
	<section class="mb-12">
		<h2>Card</h2>
		<Card.Root class="max-w-sm">
			<Card.Header>
				<Card.Title>Card Title</Card.Title>
				<Card.Description>Card description goes here.</Card.Description>
			</Card.Header>
			<Card.Content>
				<p>This is the card content area.</p>
			</Card.Content>
			<Card.Footer>
				<Button.Root>Action</Button.Root>
			</Card.Footer>
		</Card.Root>
	</section>

	<!-- Dropdown Menu -->
	<section class="mb-12">
		<h2>Dropdown Menu</h2>
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				<Button.Root variant="outline">
					Open Menu
					<ChevronDown class="ml-2 h-4 w-4" />
				</Button.Root>
			</DropdownMenu.Trigger>
			<DropdownMenu.Content>
				<DropdownMenu.Label>My Account</DropdownMenu.Label>
				<DropdownMenu.Separator />
				<DropdownMenu.Item>Profile</DropdownMenu.Item>
				<DropdownMenu.Item>Settings</DropdownMenu.Item>
				<DropdownMenu.Item>Billing</DropdownMenu.Item>
				<DropdownMenu.Separator />
				<DropdownMenu.Item>Log out</DropdownMenu.Item>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</section>

	<!-- Sheet -->
	<section class="mb-12">
		<h2>Sheet</h2>
		<Button.Root onclick={() => (sheetOpen = true)}>Open Sheet</Button.Root>
		<Sheet.Root bind:open={sheetOpen}>
			<Sheet.Content>
				<Sheet.Header>
					<Sheet.Title>Sheet Title</Sheet.Title>
					<Sheet.Description>This is a sheet component for side panels.</Sheet.Description>
				</Sheet.Header>
				<div class="py-4">
					<p>Sheet content goes here.</p>
				</div>
				<Sheet.Footer>
					<Button.Root onclick={() => (sheetOpen = false)}>Close</Button.Root>
				</Sheet.Footer>
			</Sheet.Content>
		</Sheet.Root>
	</section>

	<!-- Table -->
	<section class="mb-12">
		<h2>Table</h2>
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head>Name</Table.Head>
					<Table.Head>Email</Table.Head>
					<Table.Head>Role</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				<Table.Row>
					<Table.Cell>John Doe</Table.Cell>
					<Table.Cell>john@example.com</Table.Cell>
					<Table.Cell>Admin</Table.Cell>
				</Table.Row>
				<Table.Row>
					<Table.Cell>Jane Smith</Table.Cell>
					<Table.Cell>jane@example.com</Table.Cell>
					<Table.Cell>User</Table.Cell>
				</Table.Row>
				<Table.Row>
					<Table.Cell>Bob Johnson</Table.Cell>
					<Table.Cell>bob@example.com</Table.Cell>
					<Table.Cell>User</Table.Cell>
				</Table.Row>
			</Table.Body>
		</Table.Root>
	</section>

	<!-- Post Card -->
	<section class="mb-12">
		<h2>Post Card</h2>
		<p class="text-zinc-600 mb-4">Composable blog post card for listing pages.</p>
		<div class="space-y-6 max-w-xl">
			<PostCard.Root href="#post-1">
				<PostCard.Image src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600&h=300&fit=crop" alt="Blog post" />
				<PostCard.Title>Getting Started with SvelteKit</PostCard.Title>
				<PostCard.Excerpt>Learn how to build modern web applications with SvelteKit, the official framework for building Svelte apps.</PostCard.Excerpt>
				<PostCard.Date date={new Date()} />
			</PostCard.Root>

			<PostCard.Root href="#post-2">
				<PostCard.Title>Post Without Cover Image</PostCard.Title>
				<PostCard.Excerpt>This example shows a post card without a cover image. The component handles missing images gracefully.</PostCard.Excerpt>
				<PostCard.Date date={new Date(Date.now() - 86400000)} />
			</PostCard.Root>
		</div>
	</section>

	<!-- Prose -->
	<section class="mb-12">
		<h2>Prose</h2>
		<p class="text-zinc-600 mb-4">Typography styling for HTML content like blog posts and articles.</p>
		<div class="border border-zinc-200 rounded-lg p-6 bg-white">
			<Prose.Root>
				<h2>This is a Heading</h2>
				<p>This is a paragraph with some <strong>bold text</strong> and <em>italic text</em>. The prose component provides consistent typography styling for rendered HTML content.</p>
				<h3>A Subheading</h3>
				<ul>
					<li>First item in a list</li>
					<li>Second item with more details</li>
					<li>Third item to complete the list</li>
				</ul>
				<blockquote>This is a blockquote. It's styled with a left border and italicized text.</blockquote>
				<p>Here's some inline <code>code</code> in a paragraph.</p>
			</Prose.Root>
		</div>
	</section>

	<!-- Divider -->
	<div class="border-t border-zinc-200 my-12"></div>

	<h1 class="mb-2">Form Components</h1>
	<p class="text-zinc-600 text-lg mb-12">
		Styled form components with labels, validation errors, and Superforms integration.
	</p>

	<!-- Form Input -->
	<section class="mb-12">
		<h2>Form Input</h2>
		<p class="text-zinc-600 mb-4">Text input with label and error support.</p>
		<div class="max-w-sm space-y-4">
			<FormInput
				name="demo-input"
				label="Name"
				placeholder="Enter your name"
				bind:value={formInputValue}
			/>
			<FormInput
				name="demo-input-error"
				label="With Error"
				placeholder="Enter value"
				value=""
				error={['This field is required']}
			/>
			<FormInput
				name="demo-input-required"
				label="Required Field"
				placeholder="Required"
				required
				bind:value={formInputValue}
			/>
		</div>
	</section>

	<!-- Form Email -->
	<section class="mb-12">
		<h2>Form Email</h2>
		<p class="text-zinc-600 mb-4">Email input with default placeholder.</p>
		<div class="max-w-sm">
			<FormEmail name="demo-email" label="Email Address" bind:value={formEmailValue} />
		</div>
	</section>

	<!-- Form Select -->
	<section class="mb-12">
		<h2>Form Select</h2>
		<p class="text-zinc-600 mb-4">Dropdown select with options array.</p>
		<div class="max-w-sm">
			<FormSelect
				name="demo-select"
				label="Choose an option"
				options={formSelectOptions}
				placeholder="Select..."
				bind:value={formSelectValue}
			/>
		</div>
	</section>

	<!-- Form Textarea -->
	<section class="mb-12">
		<h2>Form Textarea</h2>
		<p class="text-zinc-600 mb-4">Multi-line text input.</p>
		<div class="max-w-sm">
			<FormTextarea
				name="demo-textarea"
				label="Message"
				placeholder="Type your message..."
				bind:value={formTextareaValue}
			/>
		</div>
	</section>

	<!-- Form Button -->
	<section class="mb-12">
		<h2>Form Button</h2>
		<p class="text-zinc-600 mb-4">Submit button with variants.</p>
		<div class="space-y-4 max-w-sm">
			<FormButton type="button">Primary (Full Width)</FormButton>
			<FormButton type="button" variant="secondary">Secondary</FormButton>
			<div class="flex gap-4">
				<FormButton type="button" fullWidth={false}>Not Full Width</FormButton>
				<FormButton type="button" variant="secondary" fullWidth={false}>Secondary</FormButton>
			</div>
		</div>
	</section>

	<!-- Form Checkbox -->
	<section class="mb-12">
		<h2>Form Checkbox</h2>
		<p class="text-zinc-600 mb-4">Checkbox with label and error support.</p>
		<div class="max-w-sm space-y-4">
			<FormCheckbox
				name="demo-checkbox"
				label="Accept terms and conditions"
				bind:checked={formCheckboxChecked}
			/>
			<FormCheckbox
				name="demo-checkbox-required"
				label="Required checkbox"
				required
				bind:checked={formCheckboxChecked}
			/>
			<FormCheckbox
				name="demo-checkbox-error"
				label="With error"
				checked={false}
				error={['You must accept the terms']}
			/>
			<FormCheckbox
				name="demo-checkbox-disabled"
				label="Disabled checkbox"
				disabled
				checked={true}
			/>
			<p class="text-sm text-zinc-500">Checked: {formCheckboxChecked}</p>
		</div>
	</section>

	<!-- Form Radio Group -->
	<section class="mb-12">
		<h2>Form Radio Group</h2>
		<p class="text-zinc-600 mb-4">Radio button group with options array.</p>
		<div class="max-w-sm space-y-6">
			<FormRadioGroup
				name="demo-radio"
				label="Choose an option"
				options={formRadioOptions}
				bind:value={formRadioValue}
			/>
			<FormRadioGroup
				name="demo-radio-required"
				label="Required selection"
				options={formRadioOptions}
				required
				bind:value={formRadioValue}
			/>
			<FormRadioGroup
				name="demo-radio-error"
				label="With error"
				options={formRadioOptions}
				value=""
				error={['Please select an option']}
			/>
			<p class="text-sm text-zinc-500">Selected: {formRadioValue}</p>
		</div>
	</section>

	<!-- Form Switch -->
	<section class="mb-12">
		<h2>Form Switch</h2>
		<p class="text-zinc-600 mb-4">Toggle switch with label support.</p>
		<div class="max-w-sm space-y-4">
			<FormSwitch name="demo-switch" label="Enable notifications" bind:checked={formSwitchChecked} />
			<FormSwitch name="demo-switch-disabled" label="Disabled switch" disabled checked={true} />
			<FormSwitch
				name="demo-switch-error"
				label="With error"
				checked={false}
				error={['This setting is required']}
			/>
			<p class="text-sm text-zinc-500">Enabled: {formSwitchChecked}</p>
		</div>
	</section>
</div>
