import { z } from 'zod';

export const demoProfileSchema = z.object({
	name: z.string().trim()
		.min(1, { error: 'Name is required.' })
		.max(80, { error: 'Name must be 80 characters or fewer.' }),
	email: z.string().trim()
		.min(1, { error: 'Email is required.' })
		.max(254, { error: 'Email must be 254 characters or fewer.' })
		.email({ error: 'Enter a valid email address.' }),
});

export type DemoProfileFormInput = z.input<typeof demoProfileSchema>;
export type DemoProfileFormValues = z.output<typeof demoProfileSchema>;