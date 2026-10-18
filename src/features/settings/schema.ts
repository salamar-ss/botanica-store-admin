import { z } from 'zod';
import { currencyCodes, storeTimeZones } from '@/features/settings/types';

export const storeSettingsSchema = z.object({
	storeName: z.string().trim()
		.min(1, { error: 'Store name is required.' })
		.max(80, { error: 'Store name must be 80 characters or fewer.' }),
	currency: z.enum(currencyCodes, { error: 'Choose a supported currency.' }),
	timeZone: z.enum(storeTimeZones, { error: 'Choose a supported time zone.' }),
	lowStockThreshold: z.string()
		.trim()
		.min(1, { error: 'Low-stock threshold is required.' })
		.refine((value) => /^\d+$/.test(value), { error: 'Enter a whole number.' })
		.transform(Number)
		.pipe(z.number().int().min(0, { error: 'Threshold cannot be negative.' }).max(10000, {
			error: 'Threshold must be 10,000 or fewer.',
		})),
});

export type StoreSettingsFormInput = z.input<typeof storeSettingsSchema>;
export type StoreSettingsFormValues = z.output<typeof storeSettingsSchema>;