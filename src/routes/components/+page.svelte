<script lang="ts">
	import {
		Alert,
		Button,
		Card,
		Checkbox,
		DropdownMenu,
		Input,
		Label,
		RadioGroup,
		Select,
		Sheet,
		Switch,
		Table,
		Textarea
	} from '$lib/components/ui';
	import { AlertCircle, ChevronDown, Menu } from 'lucide-svelte';

	let checkboxChecked = $state(false);
	let switchChecked = $state(false);
	let radioValue = $state('option1');
	let selectValue = $state('');
	let sheetOpen = $state(false);
</script>

<svelte:head>
	<title>Components - Cleanroom</title>
	<meta name="description" content="Cleanroom UI Components" />
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

	<!-- Checkbox -->
	<section class="mb-12">
		<h2>Checkbox</h2>
		<div class="flex items-center gap-2">
			<Checkbox.Root id="terms" bind:checked={checkboxChecked} />
			<Label.Root for="terms">Accept terms and conditions</Label.Root>
		</div>
		<p class="text-sm text-zinc-500 mt-2">Checked: {checkboxChecked}</p>
	</section>

	<!-- Input -->
	<section class="mb-12">
		<h2>Input</h2>
		<div class="space-y-4 max-w-sm">
			<div>
				<Label.Root for="email">Email</Label.Root>
				<Input.Root id="email" type="email" placeholder="Enter your email" />
			</div>
			<div>
				<Label.Root for="disabled">Disabled</Label.Root>
				<Input.Root id="disabled" disabled placeholder="Disabled input" />
			</div>
		</div>
	</section>

	<!-- Textarea -->
	<section class="mb-12">
		<h2>Textarea</h2>
		<div class="max-w-sm">
			<Label.Root for="message">Message</Label.Root>
			<Textarea.Root id="message" placeholder="Type your message here..." />
		</div>
	</section>

	<!-- Radio Group -->
	<section class="mb-12">
		<h2>Radio Group</h2>
		<RadioGroup.Root bind:value={radioValue} class="space-y-2">
			<div class="flex items-center gap-2">
				<RadioGroup.Item value="option1" id="option1" />
				<Label.Root for="option1">Option 1</Label.Root>
			</div>
			<div class="flex items-center gap-2">
				<RadioGroup.Item value="option2" id="option2" />
				<Label.Root for="option2">Option 2</Label.Root>
			</div>
			<div class="flex items-center gap-2">
				<RadioGroup.Item value="option3" id="option3" />
				<Label.Root for="option3">Option 3</Label.Root>
			</div>
		</RadioGroup.Root>
		<p class="text-sm text-zinc-500 mt-2">Selected: {radioValue}</p>
	</section>

	<!-- Select -->
	<section class="mb-12">
		<h2>Select</h2>
		<div class="max-w-sm">
			<Select.Root bind:value={selectValue}>
				<Select.Trigger>
					<Select.Value placeholder="Select a fruit" />
				</Select.Trigger>
				<Select.Content>
					<Select.Group>
						<Select.Label>Fruits</Select.Label>
						<Select.Item value="apple">Apple</Select.Item>
						<Select.Item value="banana">Banana</Select.Item>
						<Select.Item value="orange">Orange</Select.Item>
						<Select.Item value="grape">Grape</Select.Item>
					</Select.Group>
				</Select.Content>
			</Select.Root>
			<p class="text-sm text-zinc-500 mt-2">Selected: {selectValue || 'none'}</p>
		</div>
	</section>

	<!-- Switch -->
	<section class="mb-12">
		<h2>Switch</h2>
		<div class="flex items-center gap-2">
			<Switch.Root id="airplane" bind:checked={switchChecked} />
			<Label.Root for="airplane">Airplane Mode</Label.Root>
		</div>
		<p class="text-sm text-zinc-500 mt-2">Enabled: {switchChecked}</p>
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
</div>
