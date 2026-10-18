import { describe, expect, it } from 'vitest';
import { demoProfileSchema } from '@/features/profile/schema';

describe('demo profile validation', () => {
	it('trims valid profile fields', () => {
		expect(demoProfileSchema.parse({ name: ' Admin User ', email: ' admin@example.com ' })).toEqual({
			name: 'Admin User',
			email: 'admin@example.com',
		});
	});

	it('rejects missing names and invalid email addresses', () => {
		expect(demoProfileSchema.safeParse({ name: ' ', email: 'admin@example.com' }).success).toBe(false);
		expect(demoProfileSchema.safeParse({ name: 'Admin User', email: 'not-an-email' }).success).toBe(false);
	});
});