<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { Button, Input, Label, Card, Textarea } from '$lib/components/ui';
	import { toast } from 'svelte-sonner';
	import {
		FileText, Save, Download, Trash2, RefreshCw, Code, Edit, Eye,
		Plus, Briefcase, GraduationCap, Wrench, FolderOpen, ArrowLeft
	} from 'lucide-svelte';
	import type { ResumeData } from '$lib/utils/resume/latex';

	let { data, form } = $props();

	let activeTab = $state<'form' | 'latex' | 'preview'>('form');
	let title = $state(data.resume.title);
	let resumeData = $state<ResumeData>(data.resumeData);
	let latexSource = $state(data.resume.latexSource || '');
	let isLatexCustomized = $state(data.resume.latexCustomized);

	// Experience helpers
	function addExperience() {
		resumeData.experience = [...resumeData.experience, {
			company: '',
			position: '',
			location: '',
			startDate: '',
			endDate: '',
			current: false,
			highlights: ['']
		}];
	}

	function removeExperience(index: number) {
		resumeData.experience = resumeData.experience.filter((_, i) => i !== index);
	}

	function addExperienceHighlight(expIndex: number) {
		resumeData.experience[expIndex].highlights = [...resumeData.experience[expIndex].highlights, ''];
	}

	function removeExperienceHighlight(expIndex: number, hlIndex: number) {
		resumeData.experience[expIndex].highlights = resumeData.experience[expIndex].highlights.filter((_, i) => i !== hlIndex);
	}

	// Education helpers
	function addEducation() {
		resumeData.education = [...resumeData.education, {
			institution: '',
			degree: '',
			field: '',
			location: '',
			startDate: '',
			endDate: '',
			gpa: '',
			highlights: []
		}];
	}

	function removeEducation(index: number) {
		resumeData.education = resumeData.education.filter((_, i) => i !== index);
	}

	// Skills helpers
	function addSkillCategory() {
		resumeData.skills = [...resumeData.skills, { category: '', skills: [''] }];
	}

	function removeSkillCategory(index: number) {
		resumeData.skills = resumeData.skills.filter((_, i) => i !== index);
	}

	function addSkill(catIndex: number) {
		resumeData.skills[catIndex].skills = [...resumeData.skills[catIndex].skills, ''];
	}

	function removeSkill(catIndex: number, skillIndex: number) {
		resumeData.skills[catIndex].skills = resumeData.skills[catIndex].skills.filter((_, i) => i !== skillIndex);
	}

	// Project helpers
	function addProject() {
		resumeData.projects = [...resumeData.projects, {
			name: '',
			description: '',
			url: '',
			technologies: [],
			highlights: []
		}];
	}

	function removeProject(index: number) {
		resumeData.projects = resumeData.projects.filter((_, i) => i !== index);
	}

	// Export to PDF (using browser print)
	function exportPdf() {
		// Open a new window with the LaTeX source in a print-friendly format
		const printWindow = window.open('', '_blank');
		if (printWindow) {
			printWindow.document.write(`
				<!DOCTYPE html>
				<html>
				<head>
					<title>${title} - LaTeX Source</title>
					<style>
						body { font-family: 'Courier New', monospace; white-space: pre-wrap; padding: 20px; font-size: 11px; line-height: 1.4; }
						@media print { body { font-size: 9px; } }
					</style>
				</head>
				<body>${latexSource.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</body>
				</html>
			`);
			printWindow.document.close();
			printWindow.print();
		}
	}

	// Copy LaTeX to clipboard
	async function copyLatex() {
		try {
			await navigator.clipboard.writeText(latexSource);
			toast.success('LaTeX copied to clipboard');
		} catch {
			toast.error('Failed to copy to clipboard');
		}
	}
</script>

<svelte:head>
	<title>{data.resume.title} - Resume Builder</title>
</svelte:head>

<div class="max-w-5xl mx-auto px-6 py-8">
	<!-- Header -->
	<div class="flex items-center justify-between mb-6">
		<div class="flex items-center gap-4">
			<Button.Root variant="ghost" onclick={() => goto('/modules/resume')} class="cursor-pointer">
				<ArrowLeft class="w-4 h-4 mr-1" />
				Back
			</Button.Root>
			<div>
				<h1 class="text-2xl font-semibold">{data.resume.title}</h1>
				{#if isLatexCustomized}
					<p class="text-sm text-amber-600">LaTeX has been customized</p>
				{/if}
			</div>
		</div>
		<div class="flex items-center gap-2">
			<Button.Root variant="outline" onclick={copyLatex} class="cursor-pointer">
				<Code class="w-4 h-4 mr-1" />
				Copy LaTeX
			</Button.Root>
			<Button.Root variant="outline" onclick={exportPdf} class="cursor-pointer">
				<Download class="w-4 h-4 mr-1" />
				Print/PDF
			</Button.Root>
			<form method="POST" action="?/delete" class="inline">
				<Button.Root type="submit" variant="ghost" class="text-red-600 cursor-pointer">
					<Trash2 class="w-4 h-4" />
				</Button.Root>
			</form>
		</div>
	</div>

	<!-- Tabs -->
	<div class="border-b border-border mb-6">
		<div class="flex gap-4">
			<button
				class="px-4 py-2 border-b-2 transition-colors cursor-pointer {activeTab === 'form' ? 'border-blue-600 text-blue-600' : 'border-transparent text-muted-foreground hover:text-foreground'}"
				onclick={() => activeTab = 'form'}
			>
				<Edit class="w-4 h-4 inline mr-1" />
				Edit Form
			</button>
			<button
				class="px-4 py-2 border-b-2 transition-colors cursor-pointer {activeTab === 'latex' ? 'border-blue-600 text-blue-600' : 'border-transparent text-muted-foreground hover:text-foreground'}"
				onclick={() => activeTab = 'latex'}
			>
				<Code class="w-4 h-4 inline mr-1" />
				LaTeX Editor
			</button>
			<button
				class="px-4 py-2 border-b-2 transition-colors cursor-pointer {activeTab === 'preview' ? 'border-blue-600 text-blue-600' : 'border-transparent text-muted-foreground hover:text-foreground'}"
				onclick={() => activeTab = 'preview'}
			>
				<Eye class="w-4 h-4 inline mr-1" />
				Preview
			</button>
		</div>
	</div>

	{#if form?.error}
		<div class="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
			{form.error}
		</div>
	{/if}

	{#if form?.success}
		<div class="bg-green-50 text-green-600 p-4 rounded-lg mb-6">
			Resume saved successfully!
		</div>
	{/if}

	<!-- Form Tab -->
	{#if activeTab === 'form'}
		<form
			method="POST"
			action="?/updateData"
			use:enhance={() => {
				return async ({ result }) => {
					if (result.type === 'success') {
						toast.success('Resume saved');
					}
				};
			}}
			class="space-y-6"
		>
			<input type="hidden" name="data" value={JSON.stringify(resumeData)} />

			<!-- Resume Title -->
			<Card.Root>
				<Card.Header>
					<Card.Title>Resume Title</Card.Title>
				</Card.Header>
				<Card.Content>
					<Input.Root type="text" name="title" bind:value={title} />
				</Card.Content>
			</Card.Root>

			<!-- Personal Information -->
			<Card.Root>
				<Card.Header>
					<Card.Title>Personal Information</Card.Title>
				</Card.Header>
				<Card.Content class="space-y-4">
					<div class="grid grid-cols-2 gap-4">
						<div class="space-y-2">
							<Label.Root>Full Name *</Label.Root>
							<Input.Root type="text" bind:value={resumeData.personal.fullName} required />
						</div>
						<div class="space-y-2">
							<Label.Root>Email *</Label.Root>
							<Input.Root type="email" bind:value={resumeData.personal.email} required />
						</div>
					</div>
					<div class="grid grid-cols-2 gap-4">
						<div class="space-y-2">
							<Label.Root>Phone</Label.Root>
							<Input.Root type="tel" bind:value={resumeData.personal.phone} />
						</div>
						<div class="space-y-2">
							<Label.Root>Location</Label.Root>
							<Input.Root type="text" bind:value={resumeData.personal.location} />
						</div>
					</div>
					<div class="grid grid-cols-3 gap-4">
						<div class="space-y-2">
							<Label.Root>Website</Label.Root>
							<Input.Root type="url" bind:value={resumeData.personal.website} />
						</div>
						<div class="space-y-2">
							<Label.Root>LinkedIn</Label.Root>
							<Input.Root type="url" bind:value={resumeData.personal.linkedin} />
						</div>
						<div class="space-y-2">
							<Label.Root>GitHub</Label.Root>
							<Input.Root type="url" bind:value={resumeData.personal.github} />
						</div>
					</div>
					<div class="space-y-2">
						<Label.Root>Professional Summary</Label.Root>
						<Textarea.Root bind:value={resumeData.personal.summary} rows={3} />
					</div>
				</Card.Content>
			</Card.Root>

			<!-- Experience -->
			<Card.Root>
				<Card.Header class="flex flex-row items-center justify-between">
					<Card.Title class="flex items-center gap-2">
						<Briefcase class="w-5 h-5" />
						Experience
					</Card.Title>
					<Button.Root type="button" variant="outline" size="sm" onclick={addExperience} class="cursor-pointer">
						<Plus class="w-4 h-4 mr-1" />
						Add
					</Button.Root>
				</Card.Header>
				<Card.Content class="space-y-4">
					{#each resumeData.experience as exp, expIndex}
						<div class="border border-border rounded-lg p-4 space-y-4">
							<div class="flex justify-between">
								<span class="font-medium">Experience {expIndex + 1}</span>
								<Button.Root type="button" variant="ghost" size="sm" onclick={() => removeExperience(expIndex)} class="text-red-600 cursor-pointer">
									<Trash2 class="w-4 h-4" />
								</Button.Root>
							</div>
							<div class="grid grid-cols-2 gap-4">
								<Input.Root type="text" bind:value={exp.company} placeholder="Company" />
								<Input.Root type="text" bind:value={exp.position} placeholder="Position" />
							</div>
							<div class="grid grid-cols-3 gap-4">
								<Input.Root type="text" bind:value={exp.location} placeholder="Location" />
								<Input.Root type="text" bind:value={exp.startDate} placeholder="Start Date" />
								<Input.Root type="text" bind:value={exp.endDate} placeholder="End Date" disabled={exp.current} />
							</div>
							<div class="flex items-center gap-2">
								<input type="checkbox" bind:checked={exp.current} id="exp-current-{expIndex}" class="cursor-pointer" />
								<label for="exp-current-{expIndex}" class="text-sm cursor-pointer">Currently working here</label>
							</div>
							<div class="space-y-2">
								<div class="flex justify-between items-center">
									<Label.Root>Highlights</Label.Root>
									<Button.Root type="button" variant="ghost" size="sm" onclick={() => addExperienceHighlight(expIndex)} class="cursor-pointer">
										<Plus class="w-3 h-3" />
									</Button.Root>
								</div>
								{#each exp.highlights as _, hlIndex}
									<div class="flex gap-2">
										<Input.Root type="text" bind:value={exp.highlights[hlIndex]} placeholder="Achievement..." />
										<Button.Root type="button" variant="ghost" size="sm" onclick={() => removeExperienceHighlight(expIndex, hlIndex)} class="text-red-600 cursor-pointer">
											<Trash2 class="w-3 h-3" />
										</Button.Root>
									</div>
								{/each}
							</div>
						</div>
					{/each}
					{#if resumeData.experience.length === 0}
						<p class="text-muted-foreground text-center py-4">No experience added</p>
					{/if}
				</Card.Content>
			</Card.Root>

			<!-- Education -->
			<Card.Root>
				<Card.Header class="flex flex-row items-center justify-between">
					<Card.Title class="flex items-center gap-2">
						<GraduationCap class="w-5 h-5" />
						Education
					</Card.Title>
					<Button.Root type="button" variant="outline" size="sm" onclick={addEducation} class="cursor-pointer">
						<Plus class="w-4 h-4 mr-1" />
						Add
					</Button.Root>
				</Card.Header>
				<Card.Content class="space-y-4">
					{#each resumeData.education as edu, eduIndex}
						<div class="border border-border rounded-lg p-4 space-y-4">
							<div class="flex justify-between">
								<span class="font-medium">Education {eduIndex + 1}</span>
								<Button.Root type="button" variant="ghost" size="sm" onclick={() => removeEducation(eduIndex)} class="text-red-600 cursor-pointer">
									<Trash2 class="w-4 h-4" />
								</Button.Root>
							</div>
							<div class="grid grid-cols-2 gap-4">
								<Input.Root type="text" bind:value={edu.institution} placeholder="Institution" />
								<Input.Root type="text" bind:value={edu.degree} placeholder="Degree" />
							</div>
							<div class="grid grid-cols-2 gap-4">
								<Input.Root type="text" bind:value={edu.field} placeholder="Field of Study" />
								<Input.Root type="text" bind:value={edu.gpa} placeholder="GPA" />
							</div>
							<div class="grid grid-cols-3 gap-4">
								<Input.Root type="text" bind:value={edu.location} placeholder="Location" />
								<Input.Root type="text" bind:value={edu.startDate} placeholder="Start Date" />
								<Input.Root type="text" bind:value={edu.endDate} placeholder="End Date" />
							</div>
						</div>
					{/each}
					{#if resumeData.education.length === 0}
						<p class="text-muted-foreground text-center py-4">No education added</p>
					{/if}
				</Card.Content>
			</Card.Root>

			<!-- Skills -->
			<Card.Root>
				<Card.Header class="flex flex-row items-center justify-between">
					<Card.Title class="flex items-center gap-2">
						<Wrench class="w-5 h-5" />
						Skills
					</Card.Title>
					<Button.Root type="button" variant="outline" size="sm" onclick={addSkillCategory} class="cursor-pointer">
						<Plus class="w-4 h-4 mr-1" />
						Add Category
					</Button.Root>
				</Card.Header>
				<Card.Content class="space-y-4">
					{#each resumeData.skills as skillCat, catIndex}
						<div class="border border-border rounded-lg p-4 space-y-4">
							<div class="flex gap-4">
								<Input.Root type="text" bind:value={skillCat.category} placeholder="Category" class="flex-1" />
								<Button.Root type="button" variant="ghost" size="sm" onclick={() => removeSkillCategory(catIndex)} class="text-red-600 cursor-pointer">
									<Trash2 class="w-4 h-4" />
								</Button.Root>
							</div>
							<div class="flex flex-wrap gap-2">
								{#each skillCat.skills as _, skillIndex}
									<div class="flex items-center gap-1">
										<Input.Root type="text" bind:value={skillCat.skills[skillIndex]} placeholder="Skill" class="w-28" />
										<Button.Root type="button" variant="ghost" size="sm" onclick={() => removeSkill(catIndex, skillIndex)} class="text-red-600 cursor-pointer">
											<Trash2 class="w-3 h-3" />
										</Button.Root>
									</div>
								{/each}
								<Button.Root type="button" variant="ghost" size="sm" onclick={() => addSkill(catIndex)} class="cursor-pointer">
									<Plus class="w-3 h-3" />
								</Button.Root>
							</div>
						</div>
					{/each}
					{#if resumeData.skills.length === 0}
						<p class="text-muted-foreground text-center py-4">No skills added</p>
					{/if}
				</Card.Content>
			</Card.Root>

			<!-- Projects -->
			<Card.Root>
				<Card.Header class="flex flex-row items-center justify-between">
					<Card.Title class="flex items-center gap-2">
						<FolderOpen class="w-5 h-5" />
						Projects
					</Card.Title>
					<Button.Root type="button" variant="outline" size="sm" onclick={addProject} class="cursor-pointer">
						<Plus class="w-4 h-4 mr-1" />
						Add
					</Button.Root>
				</Card.Header>
				<Card.Content class="space-y-4">
					{#each resumeData.projects as project, projIndex}
						<div class="border border-border rounded-lg p-4 space-y-4">
							<div class="flex justify-between">
								<span class="font-medium">Project {projIndex + 1}</span>
								<Button.Root type="button" variant="ghost" size="sm" onclick={() => removeProject(projIndex)} class="text-red-600 cursor-pointer">
									<Trash2 class="w-4 h-4" />
								</Button.Root>
							</div>
							<div class="grid grid-cols-2 gap-4">
								<Input.Root type="text" bind:value={project.name} placeholder="Project Name" />
								<Input.Root type="url" bind:value={project.url} placeholder="URL" />
							</div>
							<Textarea.Root bind:value={project.description} rows={2} placeholder="Description" />
						</div>
					{/each}
					{#if resumeData.projects.length === 0}
						<p class="text-muted-foreground text-center py-4">No projects added</p>
					{/if}
				</Card.Content>
			</Card.Root>

			<div class="flex justify-end">
				<Button.Root type="submit" class="cursor-pointer">
					<Save class="w-4 h-4 mr-2" />
					Save Resume
				</Button.Root>
			</div>
		</form>
	{/if}

	<!-- LaTeX Editor Tab -->
	{#if activeTab === 'latex'}
		<div class="space-y-4">
			{#if isLatexCustomized}
				<div class="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center justify-between">
					<p class="text-amber-800 text-sm">
						You've customized the LaTeX. Changes to the form won't update LaTeX until you regenerate.
					</p>
					<form method="POST" action="?/regenerateLatex" use:enhance={() => {
						return async ({ result }) => {
							if (result.type === 'success') {
								toast.success('LaTeX regenerated from form data');
								isLatexCustomized = false;
							}
						};
					}}>
						<Button.Root type="submit" variant="outline" size="sm" class="cursor-pointer">
							<RefreshCw class="w-4 h-4 mr-1" />
							Regenerate from Form
						</Button.Root>
					</form>
				</div>
			{/if}

			<form
				method="POST"
				action="?/updateLatex"
				use:enhance={() => {
					return async ({ result }) => {
						if (result.type === 'success') {
							toast.success('LaTeX saved');
							isLatexCustomized = true;
						}
					};
				}}
			>
				<Card.Root>
					<Card.Header>
						<Card.Title class="flex items-center gap-2">
							<Code class="w-5 h-5" />
							LaTeX Source
						</Card.Title>
						<p class="text-sm text-muted-foreground">Edit the LaTeX directly for fine-grained control</p>
					</Card.Header>
					<Card.Content>
						<textarea
							name="latex"
							bind:value={latexSource}
							class="w-full h-[600px] font-mono text-sm p-4 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
							spellcheck="false"
						></textarea>
					</Card.Content>
					<Card.Footer class="justify-end">
						<Button.Root type="submit" class="cursor-pointer">
							<Save class="w-4 h-4 mr-2" />
							Save LaTeX
						</Button.Root>
					</Card.Footer>
				</Card.Root>
			</form>
		</div>
	{/if}

	<!-- Preview Tab -->
	{#if activeTab === 'preview'}
		<Card.Root>
			<Card.Header>
				<Card.Title class="flex items-center gap-2">
					<Eye class="w-5 h-5" />
					Resume Preview
				</Card.Title>
				<p class="text-sm text-muted-foreground">Preview how your resume will look. Use Print/PDF to export.</p>
			</Card.Header>
			<Card.Content>
				<div class="bg-card border border-border rounded-lg p-8 max-w-[8.5in] mx-auto shadow-sm">
					<!-- Header -->
					<div class="text-center mb-6">
						<h1 class="text-3xl font-bold text-foreground">{resumeData.personal.fullName || 'Your Name'}</h1>
						<div class="text-sm text-muted-foreground mt-2 flex flex-wrap justify-center gap-2">
							{#if resumeData.personal.email}
								<span>{resumeData.personal.email}</span>
							{/if}
							{#if resumeData.personal.phone}
								<span>• {resumeData.personal.phone}</span>
							{/if}
							{#if resumeData.personal.location}
								<span>• {resumeData.personal.location}</span>
							{/if}
						</div>
						<div class="text-sm text-blue-600 mt-1 flex flex-wrap justify-center gap-2">
							{#if resumeData.personal.website}
								<a href={resumeData.personal.website} target="_blank">Website</a>
							{/if}
							{#if resumeData.personal.linkedin}
								<a href={resumeData.personal.linkedin} target="_blank">• LinkedIn</a>
							{/if}
							{#if resumeData.personal.github}
								<a href={resumeData.personal.github} target="_blank">• GitHub</a>
							{/if}
						</div>
					</div>

					<!-- Summary -->
					{#if resumeData.personal.summary}
						<div class="mb-6">
							<h2 class="text-lg font-bold text-blue-600 border-b border-blue-600 pb-1 mb-2">Summary</h2>
							<p class="text-sm text-muted-foreground">{resumeData.personal.summary}</p>
						</div>
					{/if}

					<!-- Experience -->
					{#if resumeData.experience.length > 0}
						<div class="mb-6">
							<h2 class="text-lg font-bold text-blue-600 border-b border-blue-600 pb-1 mb-3">Experience</h2>
							{#each resumeData.experience as exp}
								<div class="mb-4">
									<div class="flex justify-between items-baseline">
										<span class="font-semibold">{exp.position}</span>
										<span class="text-sm text-muted-foreground">{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</span>
									</div>
									<div class="text-sm italic text-muted-foreground">{exp.company}{exp.location ? ` — ${exp.location}` : ''}</div>
									{#if exp.highlights.filter(h => h.trim()).length > 0}
										<ul class="list-disc list-inside text-sm text-muted-foreground mt-2">
											{#each exp.highlights.filter(h => h.trim()) as highlight}
												<li>{highlight}</li>
											{/each}
										</ul>
									{/if}
								</div>
							{/each}
						</div>
					{/if}

					<!-- Education -->
					{#if resumeData.education.length > 0}
						<div class="mb-6">
							<h2 class="text-lg font-bold text-blue-600 border-b border-blue-600 pb-1 mb-3">Education</h2>
							{#each resumeData.education as edu}
								<div class="mb-3">
									<div class="flex justify-between items-baseline">
										<span class="font-semibold">{edu.degree}{edu.field ? ` in ${edu.field}` : ''}</span>
										<span class="text-sm text-muted-foreground">{edu.startDate ? `${edu.startDate} - ` : ''}{edu.endDate || ''}</span>
									</div>
									<div class="text-sm italic text-muted-foreground">
										{edu.institution}{edu.location ? ` — ${edu.location}` : ''}{edu.gpa ? ` • GPA: ${edu.gpa}` : ''}
									</div>
								</div>
							{/each}
						</div>
					{/if}

					<!-- Skills -->
					{#if resumeData.skills.length > 0}
						<div class="mb-6">
							<h2 class="text-lg font-bold text-blue-600 border-b border-blue-600 pb-1 mb-3">Skills</h2>
							{#each resumeData.skills as skillCat}
								{#if skillCat.skills.filter(s => s.trim()).length > 0}
									<div class="mb-2">
										<span class="font-semibold text-sm">{skillCat.category}:</span>
										<span class="text-sm text-muted-foreground">{skillCat.skills.filter(s => s.trim()).join(', ')}</span>
									</div>
								{/if}
							{/each}
						</div>
					{/if}

					<!-- Projects -->
					{#if resumeData.projects.length > 0}
						<div class="mb-6">
							<h2 class="text-lg font-bold text-blue-600 border-b border-blue-600 pb-1 mb-3">Projects</h2>
							{#each resumeData.projects as project}
								<div class="mb-3">
									<div class="font-semibold">
										{project.name}
										{#if project.url}
											<a href={project.url} target="_blank" class="text-blue-600 text-sm font-normal ml-2">{project.url}</a>
										{/if}
									</div>
									{#if project.description}
										<p class="text-sm text-muted-foreground">{project.description}</p>
									{/if}
								</div>
							{/each}
						</div>
					{/if}
				</div>
			</Card.Content>
		</Card.Root>
	{/if}
</div>
