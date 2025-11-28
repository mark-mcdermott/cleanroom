export interface ProjectConfig {
	projectName: string;
	logo: {
		type: 'file' | 'emoji';
		value: string;
	};
	siteType: 'demo-page' | 'landing-simple' | 'landing-sections' | 'static-site' | 'ssr-site';
	github: {
		repoUrl: string;
	};
	cloudflare: {
		configured: boolean;
	};
	domain: {
		hasDomain: boolean;
		configured: boolean;
	};
}

export interface GeneratorModule {
	name: string;
	generate: (config: ProjectConfig, outputDir: string) => Promise<void>;
}
