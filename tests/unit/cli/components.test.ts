import { describe, it, expect } from 'vitest';
import {
	getDesktopOnlyNav,
	getNav,
	getSimpleHero,
	getSectionHero,
	getSection,
	getFooter,
	getHeader
} from '../../../src/cli/modules/base/components';
import type { ProjectConfig } from '../../../src/cli/modules/types';

describe('Component Templates', () => {
	const baseConfig: ProjectConfig = {
		projectName: 'Test App',
		logo: { type: 'emoji', value: '🚀' },
		siteType: 'demo-page',
		modules: [],
		github: { repoUrl: 'https://github.com/test/test-app' },
		cloudflare: { configured: false },
		domain: { hasDomain: false, configured: false }
	};

	describe('getDesktopOnlyNav', () => {
		it('renders emoji logo', () => {
			const nav = getDesktopOnlyNav(baseConfig);
			expect(nav).toContain('🚀');
		});

		it('renders image logo when type is file', () => {
			const config = { ...baseConfig, logo: { type: 'file' as const, value: './logo.png' } };
			const nav = getDesktopOnlyNav(config);
			expect(nav).toContain('<img');
			expect(nav).toContain('logo.png');
		});

		it('renders nav links when provided', () => {
			const links = [
				{ href: '/about', label: 'About' },
				{ href: '/contact', label: 'Contact' }
			];
			const nav = getDesktopOnlyNav(baseConfig, links);
			expect(nav).toContain('href="/about"');
			expect(nav).toContain('About');
			expect(nav).toContain('href="/contact"');
			expect(nav).toContain('Contact');
		});

		it('does not include mobile menu', () => {
			const nav = getDesktopOnlyNav(baseConfig);
			expect(nav).not.toContain('mobileMenuOpen');
			expect(nav).not.toContain('md:hidden');
		});
	});

	describe('getNav', () => {
		const links = [
			{ href: '#features', label: 'Features' },
			{ href: '#about', label: 'About' }
		];

		it('references mobile menu state (defined in parent)', () => {
			const nav = getNav(baseConfig, links);
			// mobileMenuOpen is referenced but defined in parent component's script
			expect(nav).toContain('mobileMenuOpen');
			// The $state declaration is in the layout, not the component template
			expect(nav).not.toContain('<script');
		});

		it('includes hamburger button', () => {
			const nav = getNav(baseConfig, links);
			expect(nav).toContain('aria-label="Open navigation menu"');
			expect(nav).toContain('M4 6h16M4 12h16M4 18h16');
		});

		it('includes mobile drawer', () => {
			const nav = getNav(baseConfig, links);
			expect(nav).toContain('fixed inset-0 z-50');
			expect(nav).toContain('w-64 bg-white');
		});

		it('renders both desktop and mobile links', () => {
			const nav = getNav(baseConfig, links);
			expect(nav).toContain('hidden md:flex');
			expect(nav).toContain('Features');
			expect(nav).toContain('About');
		});
	});

	describe('getSimpleHero', () => {
		it('renders project name', () => {
			const hero = getSimpleHero(baseConfig);
			expect(hero).toContain('Test App');
		});

		it('renders emoji logo inline with name', () => {
			const hero = getSimpleHero(baseConfig);
			expect(hero).toContain('🚀');
			expect(hero).toContain('flex items-center');
			expect(hero).toContain('gap-3');
		});

		it('does not include "Your site is ready!"', () => {
			const hero = getSimpleHero(baseConfig);
			expect(hero).not.toContain('Your site is ready');
		});
	});

	describe('getSectionHero', () => {
		const sections = ['Features', 'About', 'Contact'];

		it('renders section links', () => {
			const hero = getSectionHero(baseConfig, sections);
			expect(hero).toContain('href="#features"');
			expect(hero).toContain('href="#about"');
			expect(hero).toContain('href="#contact"');
		});

		it('renders project name with logo inline', () => {
			const hero = getSectionHero(baseConfig, sections);
			expect(hero).toContain('Test App');
			expect(hero).toContain('🚀');
			expect(hero).toContain('flex items-center');
		});

		it('does not include "Scroll down to explore"', () => {
			const hero = getSectionHero(baseConfig, sections);
			expect(hero).not.toContain('Scroll down');
		});
	});

	describe('getSection', () => {
		it('renders section with id, title, and content', () => {
			const section = getSection('features', 'Features', 'Our amazing features');
			expect(section).toContain('id="features"');
			expect(section).toContain('Features');
			expect(section).toContain('Our amazing features');
		});

		it('includes proper styling', () => {
			const section = getSection('test', 'Test', 'Content');
			expect(section).toContain('py-24 px-8');
			expect(section).toContain('max-w-4xl mx-auto');
		});
	});

	describe('getFooter', () => {
		it('includes copyright with project name', () => {
			const footer = getFooter(baseConfig);
			expect(footer).toContain('Test App');
			expect(footer).toContain('©');
		});

		it('includes dynamic year', () => {
			const footer = getFooter(baseConfig);
			expect(footer).toContain('{new Date().getFullYear()}');
		});
	});

	describe('getHeader', () => {
		const links = [
			{ href: '/', label: 'Home' },
			{ href: '/about', label: 'About' }
		];

		it('includes project name in header', () => {
			const header = getHeader(baseConfig, links);
			expect(header).toContain('Test App');
		});

		it('includes mobile menu', () => {
			const header = getHeader(baseConfig, links);
			expect(header).toContain('mobileMenuOpen');
			expect(header).toContain('md:hidden');
		});

		it('renders navigation links', () => {
			const header = getHeader(baseConfig, links);
			expect(header).toContain('href="/"');
			expect(header).toContain('Home');
			expect(header).toContain('href="/about"');
			expect(header).toContain('About');
		});

		it('has border styling', () => {
			const header = getHeader(baseConfig, links);
			expect(header).toContain('border-b');
		});
	});
});
