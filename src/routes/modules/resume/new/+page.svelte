<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button, Input, Label, Card, Textarea } from '$lib/components/ui';
	import { FileText, Plus, Trash2, Briefcase, GraduationCap, Wrench, FolderOpen } from 'lucide-svelte';
	import type { ResumeData, ResumeExperience, ResumeEducation, ResumeSkillCategory, ResumeProject } from '$lib/utils/resume/latex';

	let { data, form } = $props();

	let title = $state('My Resume');
	let resumeData = $state<ResumeData>(data.resumeData);

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
</script>

<svelte:head>
	<title>New Resume - Resume Builder</title>
</svelte:head>

<div class="max-w-4xl mx-auto px-6 py-12">
	<div class="mb-8">
		<h1 class="text-3xl font-semibold tracking-tight flex items-center gap-3">
			<FileText class="w-8 h-8 text-blue-600" />
			Create New Resume
		</h1>
		<p class="text-zinc-600 mt-2">Fill in your details to generate a professional resume</p>
	</div>

	<form method="POST" use:enhance class="space-y-8">
		{#if form?.error}
			<div class="bg-red-50 text-red-600 p-4 rounded-lg">
				{form.error}
			</div>
		{/if}

		<input type="hidden" name="data" value={JSON.stringify(resumeData)} />

		<!-- Resume Title -->
		<Card.Root>
			<Card.Header>
				<Card.Title>Resume Title</Card.Title>
			</Card.Header>
			<Card.Content>
				<Input.Root type="text" name="title" bind:value={title} placeholder="My Resume" />
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
						<Input.Root type="tel" bind:value={resumeData.personal.phone} placeholder="+1 (555) 123-4567" />
					</div>
					<div class="space-y-2">
						<Label.Root>Location</Label.Root>
						<Input.Root type="text" bind:value={resumeData.personal.location} placeholder="City, State" />
					</div>
				</div>
				<div class="grid grid-cols-3 gap-4">
					<div class="space-y-2">
						<Label.Root>Website</Label.Root>
						<Input.Root type="url" bind:value={resumeData.personal.website} placeholder="https://..." />
					</div>
					<div class="space-y-2">
						<Label.Root>LinkedIn</Label.Root>
						<Input.Root type="url" bind:value={resumeData.personal.linkedin} placeholder="https://linkedin.com/in/..." />
					</div>
					<div class="space-y-2">
						<Label.Root>GitHub</Label.Root>
						<Input.Root type="url" bind:value={resumeData.personal.github} placeholder="https://github.com/..." />
					</div>
				</div>
				<div class="space-y-2">
					<Label.Root>Professional Summary</Label.Root>
					<Textarea.Root bind:value={resumeData.personal.summary} rows={3} placeholder="Brief summary of your professional background..." />
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
					Add Experience
				</Button.Root>
			</Card.Header>
			<Card.Content class="space-y-6">
				{#each resumeData.experience as exp, expIndex}
					<div class="border border-zinc-200 rounded-lg p-4 space-y-4">
						<div class="flex justify-between items-start">
							<h4 class="font-medium text-zinc-700">Experience {expIndex + 1}</h4>
							<Button.Root type="button" variant="ghost" size="sm" onclick={() => removeExperience(expIndex)} class="text-red-600 cursor-pointer">
								<Trash2 class="w-4 h-4" />
							</Button.Root>
						</div>
						<div class="grid grid-cols-2 gap-4">
							<div class="space-y-2">
								<Label.Root>Company *</Label.Root>
								<Input.Root type="text" bind:value={exp.company} required />
							</div>
							<div class="space-y-2">
								<Label.Root>Position *</Label.Root>
								<Input.Root type="text" bind:value={exp.position} required />
							</div>
						</div>
						<div class="grid grid-cols-3 gap-4">
							<div class="space-y-2">
								<Label.Root>Location</Label.Root>
								<Input.Root type="text" bind:value={exp.location} />
							</div>
							<div class="space-y-2">
								<Label.Root>Start Date</Label.Root>
								<Input.Root type="text" bind:value={exp.startDate} placeholder="Jan 2020" />
							</div>
							<div class="space-y-2">
								<Label.Root>End Date</Label.Root>
								<Input.Root type="text" bind:value={exp.endDate} placeholder="Present" disabled={exp.current} />
							</div>
						</div>
						<div class="flex items-center gap-2">
							<input type="checkbox" bind:checked={exp.current} id="current-{expIndex}" class="cursor-pointer" />
							<Label.Root for="current-{expIndex}" class="cursor-pointer">Currently working here</Label.Root>
						</div>
						<div class="space-y-2">
							<div class="flex items-center justify-between">
								<Label.Root>Highlights/Achievements</Label.Root>
								<Button.Root type="button" variant="ghost" size="sm" onclick={() => addExperienceHighlight(expIndex)} class="cursor-pointer">
									<Plus class="w-3 h-3 mr-1" />
									Add
								</Button.Root>
							</div>
							{#each exp.highlights as highlight, hlIndex}
								<div class="flex gap-2">
									<Input.Root type="text" bind:value={exp.highlights[hlIndex]} placeholder="Describe an achievement..." />
									<Button.Root type="button" variant="ghost" size="sm" onclick={() => removeExperienceHighlight(expIndex, hlIndex)} class="text-red-600 cursor-pointer">
										<Trash2 class="w-4 h-4" />
									</Button.Root>
								</div>
							{/each}
						</div>
					</div>
				{/each}
				{#if resumeData.experience.length === 0}
					<p class="text-zinc-500 text-center py-4">No experience added yet</p>
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
					Add Education
				</Button.Root>
			</Card.Header>
			<Card.Content class="space-y-6">
				{#each resumeData.education as edu, eduIndex}
					<div class="border border-zinc-200 rounded-lg p-4 space-y-4">
						<div class="flex justify-between items-start">
							<h4 class="font-medium text-zinc-700">Education {eduIndex + 1}</h4>
							<Button.Root type="button" variant="ghost" size="sm" onclick={() => removeEducation(eduIndex)} class="text-red-600 cursor-pointer">
								<Trash2 class="w-4 h-4" />
							</Button.Root>
						</div>
						<div class="grid grid-cols-2 gap-4">
							<div class="space-y-2">
								<Label.Root>Institution *</Label.Root>
								<Input.Root type="text" bind:value={edu.institution} required />
							</div>
							<div class="space-y-2">
								<Label.Root>Degree *</Label.Root>
								<Input.Root type="text" bind:value={edu.degree} placeholder="Bachelor of Science" required />
							</div>
						</div>
						<div class="grid grid-cols-2 gap-4">
							<div class="space-y-2">
								<Label.Root>Field of Study</Label.Root>
								<Input.Root type="text" bind:value={edu.field} placeholder="Computer Science" />
							</div>
							<div class="space-y-2">
								<Label.Root>Location</Label.Root>
								<Input.Root type="text" bind:value={edu.location} />
							</div>
						</div>
						<div class="grid grid-cols-3 gap-4">
							<div class="space-y-2">
								<Label.Root>Start Date</Label.Root>
								<Input.Root type="text" bind:value={edu.startDate} placeholder="Sep 2016" />
							</div>
							<div class="space-y-2">
								<Label.Root>End Date</Label.Root>
								<Input.Root type="text" bind:value={edu.endDate} placeholder="May 2020" />
							</div>
							<div class="space-y-2">
								<Label.Root>GPA</Label.Root>
								<Input.Root type="text" bind:value={edu.gpa} placeholder="3.8/4.0" />
							</div>
						</div>
					</div>
				{/each}
				{#if resumeData.education.length === 0}
					<p class="text-zinc-500 text-center py-4">No education added yet</p>
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
			<Card.Content class="space-y-6">
				{#each resumeData.skills as skillCat, catIndex}
					<div class="border border-zinc-200 rounded-lg p-4 space-y-4">
						<div class="flex justify-between items-start">
							<div class="flex-1 mr-4">
								<Label.Root>Category</Label.Root>
								<Input.Root type="text" bind:value={skillCat.category} placeholder="Programming Languages" />
							</div>
							<Button.Root type="button" variant="ghost" size="sm" onclick={() => removeSkillCategory(catIndex)} class="text-red-600 cursor-pointer mt-6">
								<Trash2 class="w-4 h-4" />
							</Button.Root>
						</div>
						<div class="space-y-2">
							<div class="flex items-center justify-between">
								<Label.Root>Skills</Label.Root>
								<Button.Root type="button" variant="ghost" size="sm" onclick={() => addSkill(catIndex)} class="cursor-pointer">
									<Plus class="w-3 h-3 mr-1" />
									Add Skill
								</Button.Root>
							</div>
							<div class="flex flex-wrap gap-2">
								{#each skillCat.skills as skill, skillIndex}
									<div class="flex items-center gap-1">
										<Input.Root type="text" bind:value={skillCat.skills[skillIndex]} placeholder="Skill" class="w-32" />
										<Button.Root type="button" variant="ghost" size="sm" onclick={() => removeSkill(catIndex, skillIndex)} class="text-red-600 cursor-pointer">
											<Trash2 class="w-3 h-3" />
										</Button.Root>
									</div>
								{/each}
							</div>
						</div>
					</div>
				{/each}
				{#if resumeData.skills.length === 0}
					<p class="text-zinc-500 text-center py-4">No skills added yet</p>
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
					Add Project
				</Button.Root>
			</Card.Header>
			<Card.Content class="space-y-6">
				{#each resumeData.projects as project, projIndex}
					<div class="border border-zinc-200 rounded-lg p-4 space-y-4">
						<div class="flex justify-between items-start">
							<h4 class="font-medium text-zinc-700">Project {projIndex + 1}</h4>
							<Button.Root type="button" variant="ghost" size="sm" onclick={() => removeProject(projIndex)} class="text-red-600 cursor-pointer">
								<Trash2 class="w-4 h-4" />
							</Button.Root>
						</div>
						<div class="grid grid-cols-2 gap-4">
							<div class="space-y-2">
								<Label.Root>Project Name *</Label.Root>
								<Input.Root type="text" bind:value={project.name} required />
							</div>
							<div class="space-y-2">
								<Label.Root>URL</Label.Root>
								<Input.Root type="url" bind:value={project.url} placeholder="https://..." />
							</div>
						</div>
						<div class="space-y-2">
							<Label.Root>Description</Label.Root>
							<Textarea.Root bind:value={project.description} rows={2} />
						</div>
					</div>
				{/each}
				{#if resumeData.projects.length === 0}
					<p class="text-zinc-500 text-center py-4">No projects added yet</p>
				{/if}
			</Card.Content>
		</Card.Root>

		<!-- Submit -->
		<div class="flex justify-end gap-4">
			<Button.Root type="button" variant="outline" onclick={() => history.back()} class="cursor-pointer">
				Cancel
			</Button.Root>
			<Button.Root type="submit" class="cursor-pointer">
				<FileText class="w-4 h-4 mr-2" />
				Create Resume
			</Button.Root>
		</div>
	</form>
</div>
