import { mkdir, writeFile, copyFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { ProjectConfig, GeneratorModule } from '../types';
import {
	getPackageJson,
	getSvelteConfig,
	getViteConfig,
	getTsConfig,
	getGitignore,
	getAppCss,
	getAppHtml,
	getAppDts,
	getLayoutTs,
	getFaviconExtension
} from '../base/files';
import { getNav, getSectionHero, getSection, getFooter } from '../base/components';

const defaultSections = [
	{
		id: 'the-map',
		title: 'The Map',
		content: `It all started when Willy Wombat found the old sea chest in his grandmother's attic. Inside, beneath moth-eaten sailor's clothes and a tarnished compass, lay a weathered map—hand-drawn on what looked like kangaroo hide. The faded ink spelled out words that made his whiskers twitch: "Captain Blackpaw's Lost Treasure of the Southern Seas."

His grandmother had always said their ancestor was a famous buccaneer, but Willy had assumed it was just another one of her tall tales. The map said otherwise. X marked a spot on an uncharted island, somewhere past the reef where the old lighthouse keeper warned ships never to sail.

Willy knew right then: he had to find it. Not for the gold—well, maybe a little for the gold—but for the adventure. For the proof that the stories were real. For the chance to be more than just another wombat digging tunnels in the outback.`
	},
	{
		id: 'the-crew',
		title: 'The Crew',
		content: `No wombat sails alone. Willy gathered the most unlikely band of misfits the harbor had ever seen.

First was Peggy the Pelican, a former mail carrier who'd flown every route across the Pacific and knew the winds like the back of her wing. She talked too much and ate more fish than seemed physically possible, but there wasn't a storm she couldn't navigate.

Then came the twins: Rusty and Dusty, two red kangaroos who'd been kicked out of every boxing ring on the continent for "excessive enthusiasm." What they lacked in brains, they made up for in loyalty and an uncanny ability to punch through locked doors.

And finally, there was Old Murray the sea turtle, who claimed to be 200 years old and may have actually met Captain Blackpaw himself. He moved slow, but he remembered everything—every reef, every current, every pirate song ever sung under southern stars.

Together, they were chaos. But they were Willy's chaos.`
	},
	{
		id: 'the-voyage',
		title: 'The Voyage',
		content: `The voyage was rougher than anyone expected. Three days out, they hit the Storm of the Century—or at least that's what Old Murray called it, though Peggy pointed out he called every storm that.

Waves taller than ghost gums crashed over the deck. Lightning split the sky like cracks in old porcelain. Willy clung to the wheel while Rusty and Dusty bailed water and Peggy shouted directions from somewhere in the howling darkness above.

They lost the mainsail. They lost half their supplies. Dusty lost his favorite hat, which he wouldn't stop talking about for days.

But they didn't lose hope. Because on the morning of the fourth day, the clouds parted like curtains on a stage, and there it was: an island that wasn't on any official chart. Palm trees swaying. White sand gleaming. And somewhere in that jungle, if the map was right, a fortune waiting to be found.`
	},
	{
		id: 'the-treasure',
		title: 'The Treasure',
		content: `The booby traps nearly got them. Twice.

Willy's burrowing instincts saved the crew from a pit of spikes, and Old Murray's ancient memory helped them solve the riddle carved into the cave entrance: "Only those who dig deep find what glitters."

The treasure chamber was everything Willy had dreamed of and nothing like he expected. Yes, there were gold doubloons stacked in pyramids. Yes, there were rubies the size of plums and pearls that glowed in the torchlight. But in the center of it all sat a small wooden box, and inside that box was something worth more than all the gold combined.

A letter. From Captain Blackpaw to his descendants. It spoke of adventure being the real treasure. Of the friends you make and the fears you face. Of how the journey matters more than the destination.

Willy folded the letter carefully and tucked it into his vest. Then he looked at his crew—Peggy preening proudly, the twins stuffing their pouches with coins, Old Murray smiling that ancient knowing smile.

"Alright, mates," Willy said. "Let's go home. We've got stories to tell."

And they did. The best stories the harbor had ever heard.`
	}
];

function getLayoutSvelte(config: ProjectConfig): string {
	const nav = getNav(
		config,
		defaultSections.map((s) => ({ href: `#${s.id}`, label: s.title }))
	);
	const footer = getFooter(config);

	return `<script lang="ts">
	import '../app.css';

	let { children } = $props();
	let mobileMenuOpen = $state(false);
</script>

<div class="min-h-dvh flex flex-col">
	${nav}

	<main class="flex-1">
		{@render children()}
	</main>

	${footer}
</div>
`;
}

function getPageSvelte(config: ProjectConfig): string {
	const hero = getSectionHero(
		config,
		defaultSections.map((s) => s.title)
	);
	const sections = defaultSections.map((s) => getSection(s.id, s.title, s.content)).join('\n\n');

	return `<svelte:head>
	<title>${config.projectName}</title>
	<meta name="description" content="${config.projectName}" />
</svelte:head>

${hero}

${sections}
`;
}

export const landingSectionsModule: GeneratorModule = {
	name: 'landing-sections',
	async generate(config: ProjectConfig, outputDir: string) {
		// Create directory structure
		await mkdir(join(outputDir, 'src', 'routes'), { recursive: true });
		await mkdir(join(outputDir, 'static'), { recursive: true });

		// Write config files
		await writeFile(join(outputDir, 'package.json'), getPackageJson(config));
		await writeFile(join(outputDir, 'svelte.config.js'), getSvelteConfig());
		await writeFile(join(outputDir, 'vite.config.ts'), getViteConfig());
		await writeFile(join(outputDir, 'tsconfig.json'), getTsConfig());
		await writeFile(join(outputDir, '.gitignore'), getGitignore());

		// Write app files
		await writeFile(join(outputDir, 'src', 'app.css'), getAppCss());
		await writeFile(join(outputDir, 'src', 'app.html'), getAppHtml(config));
		await writeFile(join(outputDir, 'src', 'app.d.ts'), getAppDts());

		// Write route files
		await writeFile(join(outputDir, 'src', 'routes', '+layout.svelte'), getLayoutSvelte(config));
		await writeFile(join(outputDir, 'src', 'routes', '+layout.ts'), getLayoutTs());
		await writeFile(join(outputDir, 'src', 'routes', '+page.svelte'), getPageSvelte(config));

		// Copy logo file to static folder (as both favicon and logo)
		if (config.logo.type === 'file') {
			try {
				const ext = getFaviconExtension(config.logo.value);
				await copyFile(config.logo.value, join(outputDir, 'static', `favicon.${ext}`));
				await copyFile(config.logo.value, join(outputDir, 'static', `logo.${ext}`));
			} catch {
				// Logo file doesn't exist or can't be copied
			}
		}
	}
};
