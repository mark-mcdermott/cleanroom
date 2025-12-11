import type { FeatureModule } from '../types';
import { authModule } from './auth';
import { blogModule } from './blog';
import { darkToggleModule } from './dark-toggle';
import { leaderboardModule } from './leaderboard';
import { lobbyModule } from './lobby';
import { merchModule } from './merch';
import { officeUsersModule } from './office-users';
import { resumeModule } from './resume';
import { storeModule } from './store';
import { themePreviewModule } from './theme-preview';
import { trackerModule } from './tracker';
import { videosModule } from './videos';
import { widgetsModule } from './widgets';

export const featureModules: Record<string, FeatureModule> = {
	auth: authModule,
	blog: blogModule,
	'dark-toggle': darkToggleModule,
	leaderboard: leaderboardModule,
	lobby: lobbyModule,
	merch: merchModule,
	'office-users': officeUsersModule,
	resume: resumeModule,
	store: storeModule,
	'theme-preview': themePreviewModule,
	tracker: trackerModule,
	videos: videosModule,
	widgets: widgetsModule
};
