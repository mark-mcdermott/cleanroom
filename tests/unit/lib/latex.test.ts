import { describe, it, expect } from 'vitest';
import {
	generateLatex,
	createEmptyResumeData,
	parseResumeData,
	type ResumeData
} from '../../../src/lib/utils/resume/latex';

describe('Resume LaTeX Utilities', () => {
	describe('createEmptyResumeData', () => {
		it('should create empty resume data with all required fields', () => {
			const data = createEmptyResumeData();

			expect(data.personal).toBeDefined();
			expect(data.personal.fullName).toBe('');
			expect(data.personal.email).toBe('');
			expect(data.experience).toEqual([]);
			expect(data.education).toEqual([]);
			expect(data.skills).toEqual([]);
			expect(data.projects).toEqual([]);
		});

		it('should create unique instances', () => {
			const data1 = createEmptyResumeData();
			const data2 = createEmptyResumeData();

			data1.personal.fullName = 'Test';
			expect(data2.personal.fullName).toBe('');
		});
	});

	describe('parseResumeData', () => {
		it('should parse valid JSON', () => {
			const json = JSON.stringify({
				personal: { fullName: 'John Doe', email: 'john@example.com' },
				experience: [],
				education: [],
				skills: [],
				projects: []
			});

			const data = parseResumeData(json);
			expect(data.personal.fullName).toBe('John Doe');
			expect(data.personal.email).toBe('john@example.com');
		});

		it('should handle invalid JSON gracefully', () => {
			const data = parseResumeData('invalid json');
			expect(data.personal).toBeDefined();
			expect(data.experience).toEqual([]);
		});

		it('should fill missing fields with defaults', () => {
			const json = JSON.stringify({
				personal: { fullName: 'Jane' }
			});

			const data = parseResumeData(json);
			expect(data.personal.fullName).toBe('Jane');
			expect(data.experience).toEqual([]);
			expect(data.education).toEqual([]);
		});

		it('should handle empty string', () => {
			const data = parseResumeData('');
			expect(data.personal).toBeDefined();
		});
	});

	describe('generateLatex', () => {
		it('should generate valid LaTeX document structure', () => {
			const data = createEmptyResumeData();
			data.personal.fullName = 'John Doe';
			data.personal.email = 'john@example.com';

			const latex = generateLatex(data);

			expect(latex).toContain('\\documentclass');
			expect(latex).toContain('\\begin{document}');
			expect(latex).toContain('\\end{document}');
			expect(latex).toContain('John Doe');
			expect(latex).toContain('john@example.com');
		});

		it('should escape LaTeX special characters', () => {
			const data = createEmptyResumeData();
			data.personal.fullName = 'John & Jane Doe';
			data.personal.summary = 'Uses $100 and 50% discount';

			const latex = generateLatex(data);

			expect(latex).toContain('John \\& Jane Doe');
			expect(latex).toContain('\\$100');
			expect(latex).toContain('50\\%');
		});

		it('should escape underscore characters', () => {
			const data = createEmptyResumeData();
			data.personal.email = 'john_doe@example.com';

			const latex = generateLatex(data);

			expect(latex).toContain('john\\_doe@example.com');
		});

		it('should escape hash characters', () => {
			const data = createEmptyResumeData();
			data.personal.summary = 'C# developer';

			const latex = generateLatex(data);

			expect(latex).toContain('C\\# developer');
		});

		it('should include experience section when present', () => {
			const data = createEmptyResumeData();
			data.personal.fullName = 'John';
			data.personal.email = 'j@e.com';
			data.experience = [
				{
					company: 'Tech Corp',
					position: 'Developer',
					startDate: 'Jan 2020',
					endDate: 'Dec 2022',
					current: false,
					location: 'NYC',
					highlights: ['Built features', 'Fixed bugs']
				}
			];

			const latex = generateLatex(data);

			expect(latex).toContain('\\section{Experience}');
			expect(latex).toContain('Tech Corp');
			expect(latex).toContain('Developer');
			expect(latex).toContain('Built features');
			expect(latex).toContain('Fixed bugs');
		});

		it('should handle current job correctly', () => {
			const data = createEmptyResumeData();
			data.personal.fullName = 'John';
			data.personal.email = 'j@e.com';
			data.experience = [
				{
					company: 'Current Co',
					position: 'Dev',
					startDate: 'Jan 2023',
					current: true,
					highlights: []
				}
			];

			const latex = generateLatex(data);

			expect(latex).toContain('Present');
		});

		it('should include education section when present', () => {
			const data = createEmptyResumeData();
			data.personal.fullName = 'John';
			data.personal.email = 'j@e.com';
			data.education = [
				{
					institution: 'MIT',
					degree: 'BS',
					field: 'Computer Science',
					startDate: '2016',
					endDate: '2020',
					gpa: '3.9'
				}
			];

			const latex = generateLatex(data);

			expect(latex).toContain('\\section{Education}');
			expect(latex).toContain('MIT');
			expect(latex).toContain('Computer Science');
			expect(latex).toContain('3.9');
		});

		it('should include skills section when present', () => {
			const data = createEmptyResumeData();
			data.personal.fullName = 'John';
			data.personal.email = 'j@e.com';
			data.skills = [
				{ category: 'Languages', skills: ['JavaScript', 'Python', 'Go'] },
				{ category: 'Tools', skills: ['Git', 'Docker'] }
			];

			const latex = generateLatex(data);

			expect(latex).toContain('\\section{Skills}');
			expect(latex).toContain('Languages');
			expect(latex).toContain('JavaScript, Python, Go');
			expect(latex).toContain('Tools');
		});

		it('should include projects section when present', () => {
			const data = createEmptyResumeData();
			data.personal.fullName = 'John';
			data.personal.email = 'j@e.com';
			data.projects = [
				{
					name: 'Cool Project',
					description: 'A cool thing',
					url: 'https://example.com'
				}
			];

			const latex = generateLatex(data);

			expect(latex).toContain('\\section{Projects}');
			expect(latex).toContain('Cool Project');
			expect(latex).toContain('A cool thing');
		});

		it('should include links in header when present', () => {
			const data = createEmptyResumeData();
			data.personal.fullName = 'John';
			data.personal.email = 'j@e.com';
			data.personal.website = 'https://john.dev';
			data.personal.linkedin = 'https://linkedin.com/in/john';
			data.personal.github = 'https://github.com/john';

			const latex = generateLatex(data);

			expect(latex).toContain('Website');
			expect(latex).toContain('LinkedIn');
			expect(latex).toContain('GitHub');
		});

		it('should include phone and location when present', () => {
			const data = createEmptyResumeData();
			data.personal.fullName = 'John';
			data.personal.email = 'j@e.com';
			data.personal.phone = '+1 555 123 4567';
			data.personal.location = 'New York, NY';

			const latex = generateLatex(data);

			expect(latex).toContain('+1 555 123 4567');
			expect(latex).toContain('New York, NY');
		});

		it('should include summary when present', () => {
			const data = createEmptyResumeData();
			data.personal.fullName = 'John';
			data.personal.email = 'j@e.com';
			data.personal.summary = 'Experienced developer with 10 years of experience.';

			const latex = generateLatex(data);

			expect(latex).toContain('\\section{Summary}');
			expect(latex).toContain('Experienced developer');
		});

		it('should not include sections when empty', () => {
			const data = createEmptyResumeData();
			data.personal.fullName = 'John';
			data.personal.email = 'j@e.com';

			const latex = generateLatex(data);

			expect(latex).not.toContain('\\section{Experience}');
			expect(latex).not.toContain('\\section{Education}');
			expect(latex).not.toContain('\\section{Skills}');
			expect(latex).not.toContain('\\section{Projects}');
		});

		it('should handle complex data with all sections', () => {
			const data: ResumeData = {
				personal: {
					fullName: 'Jane Smith',
					email: 'jane@example.com',
					phone: '+1 555 999 0000',
					location: 'San Francisco, CA',
					website: 'https://jane.dev',
					linkedin: 'https://linkedin.com/in/jane',
					github: 'https://github.com/jane',
					summary: 'Full-stack developer with passion for clean code.'
				},
				experience: [
					{
						company: 'Big Tech',
						position: 'Senior Developer',
						location: 'SF',
						startDate: 'Jan 2020',
						current: true,
						highlights: ['Led team of 5', 'Shipped major features']
					},
					{
						company: 'Startup Inc',
						position: 'Developer',
						startDate: 'Jun 2018',
						endDate: 'Dec 2019',
						current: false,
						highlights: ['Built MVP']
					}
				],
				education: [
					{
						institution: 'Stanford',
						degree: 'MS',
						field: 'Computer Science',
						endDate: '2018',
						gpa: '3.95'
					}
				],
				skills: [
					{ category: 'Languages', skills: ['TypeScript', 'Python'] },
					{ category: 'Frameworks', skills: ['React', 'Node.js'] }
				],
				projects: [
					{
						name: 'Open Source Tool',
						description: 'Useful utility',
						url: 'https://github.com/jane/tool'
					}
				]
			};

			const latex = generateLatex(data);

			// Verify structure
			expect(latex).toContain('\\documentclass');
			expect(latex).toContain('\\begin{document}');
			expect(latex).toContain('\\end{document}');

			// Verify all sections present
			expect(latex).toContain('\\section{Summary}');
			expect(latex).toContain('\\section{Experience}');
			expect(latex).toContain('\\section{Education}');
			expect(latex).toContain('\\section{Skills}');
			expect(latex).toContain('\\section{Projects}');

			// Verify content
			expect(latex).toContain('Jane Smith');
			expect(latex).toContain('Big Tech');
			expect(latex).toContain('Stanford');
		});
	});
});
