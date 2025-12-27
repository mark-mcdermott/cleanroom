// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
import type { Session, User } from 'lucia';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: User | null;
			session: Session | null;
		}
		// interface PageData {}
		// interface PageState {}
		interface Platform {
			env: {
				DATABASE_URL: string;
				AVATARS: R2Bucket;
				WIDGET_PHOTOS: R2Bucket;
				STRIPE_SECRET_KEY?: string;
				STRIPE_WEBHOOK_SECRET?: string;
				PRINTFUL_API_KEY?: string;
			};
		}
	}
}

export {};
