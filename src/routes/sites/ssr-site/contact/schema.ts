import { z } from 'zod';

export const contactSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	email: z.string().email('Please enter a valid email'),
	subject: z.string().min(1, 'Please select a subject'),
	message: z.string().min(10, 'Message must be at least 10 characters')
});

export type ContactSchema = typeof contactSchema;
