import type { NavLink, DropdownLink } from '$lib/components/blocks';
import { User, Settings, LogOut, Github } from 'lucide-svelte';

export const defaultNavLinks: NavLink[] = [
	{ label: 'components', href: '/components', testId: 'nav-components' },
	{ label: 'blocks', href: '/blocks', testId: 'nav-blocks' },
	// {
	// 	label: 'sites',
	// 	testId: 'nav-sites',
	// 	children: [
	// 		{ label: 'demo', href: '/sites/demo', testId: 'nav-sites-demo' },
	// 		{ label: 'landing (no nav)', href: '/sites/landing-simple', testId: 'nav-sites-landing-simple' },
	// 		{ label: 'landing (jump links)', href: '/sites/landing-sections', testId: 'nav-sites-landing-sections' },
	// 		{ label: 'static site', href: '/sites/static-site', testId: 'nav-sites-static-site' },
	// 		{ label: 'ssr site', href: '/sites/ssr-site', testId: 'nav-sites-ssr-site' }
	// 	]
	// },
	{
		label: 'modules',
		testId: 'nav-modules',
		children: [
			{ label: 'blog', href: '/modules/blog', testId: 'nav-modules-blog' },
			{ label: 'leaderboard', href: '/modules/leaderboard', testId: 'nav-modules-leaderboard' },
			{ label: 'lobby', href: '/modules/lobby', testId: 'nav-modules-lobby' },
			{ label: 'resume', href: '/modules/resume', testId: 'nav-modules-resume' },
			{ label: 'store', href: '/modules/store', testId: 'nav-modules-store' },
			{ label: 'tracker', href: '/modules/tracker', testId: 'nav-modules-tracker' },
			{ label: 'videos', href: '/modules/videos', testId: 'nav-modules-videos' },
			{ label: 'widgets', href: '/modules/widgets', testId: 'nav-modules-widgets' }
		]
	},
	{
		label: 'add-ons',
		testId: 'nav-addons',
		children: [
			{ label: 'auth', href: '/modules/auth', testId: 'nav-addons-auth' },
			{ label: 'dark toggle', href: '/modules/dark-toggle', testId: 'nav-addons-dark-toggle' },
			{ label: 'merch', href: '/modules/store', testId: 'nav-addons-merch' },
			{ label: 'office users', href: '/modules/office-users', testId: 'nav-addons-office' },
			{ label: 'theme preview', href: '/modules/theme-preview', testId: 'nav-addons-theme-preview' }
		]
	},
	{ label: 'merch', href: '/merch', testId: 'nav-merch' },
	{ label: 'login', href: '/login', testId: 'nav-login', hideWhenAuth: true },
	{ label: 'signup', href: '/signup', testId: 'nav-signup', hideWhenAuth: true },
	{ label: 'users', href: '/admin/users', testId: 'nav-users', requiresAuth: true, requiresAdmin: true },
	{ label: 'posts', href: '/admin/posts', testId: 'nav-posts', requiresAuth: true, requiresAdmin: true },
	{ icon: Github, iconSize: 'lg', href: 'https://github.com/mark-mcdermott/cleanroom', testId: 'nav-github' }
];

export function getDefaultAvatarLinks(profileUrl: string): DropdownLink[] {
	return [
		{ label: 'Profile', href: profileUrl, icon: User, testId: 'menu-profile' },
		{ label: 'Settings', href: '/account', icon: Settings, testId: 'menu-settings' },
		{ label: 'Sign Out', action: '/logout', method: 'POST', icon: LogOut, testId: 'menu-signout', separator: true }
	];
}
