import type { NavLink, DropdownLink } from '$lib/components/blocks';
import { User, Settings, LogOut } from 'lucide-svelte';

export const defaultNavLinks: NavLink[] = [
	{ label: 'components', href: '/components', testId: 'nav-components' },
	{ label: 'blocks', href: '/blocks', testId: 'nav-blocks' },
	{
		label: 'sites',
		testId: 'nav-sites',
		children: [
			{ label: 'demo', href: '/sites/demo', testId: 'nav-sites-demo' },
			{ label: 'landing (no nav)', href: '/sites/landing-simple', testId: 'nav-sites-landing-simple' },
			{ label: 'landing (jump links)', href: '/sites/landing-sections', testId: 'nav-sites-landing-sections' },
			{ label: 'static site', href: '/sites/static-site', testId: 'nav-sites-static-site' }
		]
	},
	{ label: 'login', href: '/login', testId: 'nav-login', hideWhenAuth: true },
	{ label: 'signup', href: '/signup', testId: 'nav-signup', hideWhenAuth: true },
	{ label: 'admin', href: '/admin', testId: 'nav-admin', requiresAuth: true, requiresAdmin: true }
];

export function getDefaultAvatarLinks(profileUrl: string): DropdownLink[] {
	return [
		{ label: 'Profile', href: profileUrl, icon: User, testId: 'menu-profile' },
		{ label: 'Settings', href: '/account', icon: Settings, testId: 'menu-settings' },
		{ label: 'Sign Out', action: '/logout', method: 'POST', icon: LogOut, testId: 'menu-signout', separator: true }
	];
}
