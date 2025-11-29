import type { FeatureModule } from '../types';
import { authModule } from './auth';
import { blogModule } from './blog';
import { darkToggleModule } from './dark-toggle';
import { leaderboardModule } from './leaderboard';
import { lobbyModule } from './lobby';
import { officeUsersModule } from './office-users';
import { resumeModule } from './resume';
import { storeModule } from './store';
import { trackerModule } from './tracker';
import { videosModule } from './videos';
import { widgetsModule } from './widgets';

export const featureModules: Record<string, FeatureModule> = {
	auth: authModule,
	blog: blogModule,
	'dark-toggle': darkToggleModule,
	leaderboard: leaderboardModule,
	lobby: lobbyModule,
	'office-users': officeUsersModule,
	resume: resumeModule,
	store: storeModule,
	tracker: trackerModule,
	videos: videosModule,
	widgets: widgetsModule
};
