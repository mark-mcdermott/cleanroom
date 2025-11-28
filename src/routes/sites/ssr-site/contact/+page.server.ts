import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import type { Actions, PageServerLoad } from './$types';
import { contactSchema } from './schema';

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod4(contactSchema));
	return { form };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, zod4(contactSchema));

		if (!form.valid) {
			return message(form, 'Please fix the errors below', { status: 400 });
		}

		// Demo: In a real app, send email or save to database here
		console.log('Contact form submitted:', form.data);

		return message(form, 'Message sent successfully!');
	}
};
