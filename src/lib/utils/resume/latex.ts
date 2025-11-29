// Resume data types
export interface ResumePersonal {
	fullName: string;
	email: string;
	phone?: string;
	location?: string;
	website?: string;
	linkedin?: string;
	github?: string;
	summary?: string;
}

export interface ResumeExperience {
	company: string;
	position: string;
	location?: string;
	startDate: string;
	endDate?: string;
	current?: boolean;
	highlights: string[];
}

export interface ResumeEducation {
	institution: string;
	degree: string;
	field?: string;
	location?: string;
	startDate?: string;
	endDate?: string;
	gpa?: string;
	highlights?: string[];
}

export interface ResumeProject {
	name: string;
	description?: string;
	url?: string;
	technologies?: string[];
	highlights?: string[];
}

export interface ResumeSkillCategory {
	category: string;
	skills: string[];
}

export interface ResumeData {
	personal: ResumePersonal;
	experience: ResumeExperience[];
	education: ResumeEducation[];
	skills: ResumeSkillCategory[];
	projects: ResumeProject[];
}

// Helper to escape LaTeX special characters
function escapeLatex(text: string): string {
	if (!text) return '';
	return text
		.replace(/\\/g, '\\textbackslash{}')
		.replace(/&/g, '\\&')
		.replace(/%/g, '\\%')
		.replace(/\$/g, '\\$')
		.replace(/#/g, '\\#')
		.replace(/_/g, '\\_')
		.replace(/\{/g, '\\{')
		.replace(/\}/g, '\\}')
		.replace(/~/g, '\\textasciitilde{}')
		.replace(/\^/g, '\\textasciicircum{}');
}

// Generate LaTeX source from resume data
export function generateLatex(data: ResumeData): string {
	const { personal, experience, education, skills, projects } = data;

	let latex = `\\documentclass[11pt,letterpaper]{article}

% Packages
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage{lmodern}
\\usepackage[margin=0.75in]{geometry}
\\usepackage{hyperref}
\\usepackage{enumitem}
\\usepackage{titlesec}
\\usepackage{xcolor}

% Colors
\\definecolor{primary}{RGB}{0, 102, 204}
\\definecolor{gray}{RGB}{100, 100, 100}

% Hyperref setup
\\hypersetup{
    colorlinks=true,
    linkcolor=primary,
    urlcolor=primary
}

% Section formatting
\\titleformat{\\section}{\\Large\\bfseries\\color{primary}}{}{0em}{}[\\titlerule]
\\titlespacing{\\section}{0pt}{12pt}{6pt}

% List formatting
\\setlist[itemize]{leftmargin=*, nosep, topsep=2pt}

% Remove page numbers
\\pagestyle{empty}

\\begin{document}

%----------------------------------------------------------------------------------------
%	HEADER
%----------------------------------------------------------------------------------------

\\begin{center}
    {\\Huge\\bfseries ${escapeLatex(personal.fullName)}}\\\\[6pt]
`;

	// Contact info line
	const contactItems: string[] = [];
	if (personal.email) contactItems.push(`\\href{mailto:${escapeLatex(personal.email)}}{${escapeLatex(personal.email)}}`);
	if (personal.phone) contactItems.push(escapeLatex(personal.phone));
	if (personal.location) contactItems.push(escapeLatex(personal.location));
	if (contactItems.length > 0) {
		latex += `    {\\small\\color{gray} ${contactItems.join(' $\\cdot$ ')}}\\\\[3pt]\n`;
	}

	// Links line
	const linkItems: string[] = [];
	if (personal.website) linkItems.push(`\\href{${escapeLatex(personal.website)}}{Website}`);
	if (personal.linkedin) linkItems.push(`\\href{${escapeLatex(personal.linkedin)}}{LinkedIn}`);
	if (personal.github) linkItems.push(`\\href{${escapeLatex(personal.github)}}{GitHub}`);
	if (linkItems.length > 0) {
		latex += `    {\\small ${linkItems.join(' $\\cdot$ ')}}\n`;
	}

	latex += `\\end{center}

`;

	// Summary
	if (personal.summary) {
		latex += `%----------------------------------------------------------------------------------------
%	SUMMARY
%----------------------------------------------------------------------------------------

\\section{Summary}
${escapeLatex(personal.summary)}

`;
	}

	// Experience
	if (experience.length > 0) {
		latex += `%----------------------------------------------------------------------------------------
%	EXPERIENCE
%----------------------------------------------------------------------------------------

\\section{Experience}

`;
		for (const exp of experience) {
			const dateRange = exp.current ? `${exp.startDate} -- Present` : `${exp.startDate} -- ${exp.endDate || ''}`;
			latex += `\\textbf{${escapeLatex(exp.position)}} \\hfill ${escapeLatex(dateRange)}\\\\
\\textit{${escapeLatex(exp.company)}}${exp.location ? ` -- ${escapeLatex(exp.location)}` : ''}
`;
			if (exp.highlights.length > 0) {
				latex += `\\begin{itemize}
`;
				for (const highlight of exp.highlights) {
					if (highlight.trim()) {
						latex += `    \\item ${escapeLatex(highlight)}
`;
					}
				}
				latex += `\\end{itemize}
`;
			}
			latex += `\\vspace{6pt}

`;
		}
	}

	// Education
	if (education.length > 0) {
		latex += `%----------------------------------------------------------------------------------------
%	EDUCATION
%----------------------------------------------------------------------------------------

\\section{Education}

`;
		for (const edu of education) {
			const dateRange = edu.startDate ? `${edu.startDate} -- ${edu.endDate || 'Present'}` : (edu.endDate || '');
			latex += `\\textbf{${escapeLatex(edu.degree)}}${edu.field ? ` in ${escapeLatex(edu.field)}` : ''} \\hfill ${escapeLatex(dateRange)}\\\\
\\textit{${escapeLatex(edu.institution)}}${edu.location ? ` -- ${escapeLatex(edu.location)}` : ''}${edu.gpa ? ` $\\cdot$ GPA: ${escapeLatex(edu.gpa)}` : ''}
`;
			if (edu.highlights && edu.highlights.length > 0) {
				latex += `\\begin{itemize}
`;
				for (const highlight of edu.highlights) {
					if (highlight.trim()) {
						latex += `    \\item ${escapeLatex(highlight)}
`;
					}
				}
				latex += `\\end{itemize}
`;
			}
			latex += `\\vspace{6pt}

`;
		}
	}

	// Skills
	if (skills.length > 0) {
		latex += `%----------------------------------------------------------------------------------------
%	SKILLS
%----------------------------------------------------------------------------------------

\\section{Skills}

\\begin{itemize}[leftmargin=0pt, label={}]
`;
		for (const skillCat of skills) {
			if (skillCat.skills.length > 0) {
				latex += `    \\item \\textbf{${escapeLatex(skillCat.category)}:} ${skillCat.skills.map(s => escapeLatex(s)).join(', ')}
`;
			}
		}
		latex += `\\end{itemize}

`;
	}

	// Projects
	if (projects.length > 0) {
		latex += `%----------------------------------------------------------------------------------------
%	PROJECTS
%----------------------------------------------------------------------------------------

\\section{Projects}

`;
		for (const project of projects) {
			latex += `\\textbf{${escapeLatex(project.name)}}`;
			if (project.url) {
				latex += ` -- \\href{${escapeLatex(project.url)}}{${escapeLatex(project.url)}}`;
			}
			latex += `\\\\
`;
			if (project.description) {
				latex += `${escapeLatex(project.description)}\\\\
`;
			}
			if (project.technologies && project.technologies.length > 0) {
				latex += `\\textit{Technologies: ${project.technologies.map(t => escapeLatex(t)).join(', ')}}
`;
			}
			if (project.highlights && project.highlights.length > 0) {
				latex += `\\begin{itemize}
`;
				for (const highlight of project.highlights) {
					if (highlight.trim()) {
						latex += `    \\item ${escapeLatex(highlight)}
`;
					}
				}
				latex += `\\end{itemize}
`;
			}
			latex += `\\vspace{6pt}

`;
		}
	}

	latex += `\\end{document}
`;

	return latex;
}

// Create empty resume data structure
export function createEmptyResumeData(): ResumeData {
	return {
		personal: {
			fullName: '',
			email: '',
			phone: '',
			location: '',
			website: '',
			linkedin: '',
			github: '',
			summary: ''
		},
		experience: [],
		education: [],
		skills: [],
		projects: []
	};
}

// Parse JSON string to ResumeData
export function parseResumeData(jsonString: string): ResumeData {
	try {
		const data = JSON.parse(jsonString);
		return {
			personal: data.personal || createEmptyResumeData().personal,
			experience: data.experience || [],
			education: data.education || [],
			skills: data.skills || [],
			projects: data.projects || []
		};
	} catch {
		return createEmptyResumeData();
	}
}
