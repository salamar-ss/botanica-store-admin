import { describe, expect, it } from 'vitest';
import { storeSettingsSchema } from '@/features/settings/schema';

describe('store settings validation', () => {
	it('trims the store name and parses the threshold to an integer', () => {
		expect(storeSettingsSchema.parse({
			storeName: ' Botanica ',
			currency: 'EUR',
			timeZone: 'Europe/Dublin',
			lowStockThreshold: '12',
		})).toEqual({
			storeName: 'Botanica',
			currency: 'EUR',
			timeZone: 'Europe/Dublin',
			lowStockThreshold: 12,
		});
	});

	it('rejects unsupported currency, time zone, and fractional thresholds', () => {
		const result = storeSettingsSchema.safeParse({
			storeName: 'Botanica',
			currency: 'ZZZ',
			timeZone: 'Mars/Olympus',
			lowStockThreshold: '2.5',
		});

		expect(result.success).toBe(false);
	});
});