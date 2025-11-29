import type { FeatureModule } from '../types';
import { authModule } from './auth';
import { blogModule } from './blog';
import { officeUsersModule } from './office-users';
import { storeModule } from './store';

export const featureModules: Record<string, FeatureModule> = {
	auth: authModule,
	blog: blogModule,
	'office-users': officeUsersModule,
	store: storeModule
};
