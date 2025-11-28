import type { GeneratorModule } from './types';
import { demoPageModule } from './demo-page';
import { landingSimpleModule } from './landing-simple';
import { landingSectionsModule } from './landing-sections';
import { staticSiteModule } from './static-site';
import { ssrSiteModule } from './ssr-site';

export const modules: Record<string, GeneratorModule> = {
	'demo-page': demoPageModule,
	'landing-simple': landingSimpleModule,
	'landing-sections': landingSectionsModule,
	'static-site': staticSiteModule,
	'ssr-site': ssrSiteModule
};

export * from './types';
