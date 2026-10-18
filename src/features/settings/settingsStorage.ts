import { storeSettingsSchema } from '@/features/settings/schema';
import { defaultStoreSettings, type StoreSettings } from '@/features/settings/types';

const storageKey = 'botanica-admin-settings';

export function loadStoreSettings(): StoreSettings {
	try {
		const savedSettings = localStorage.getItem(storageKey);
		if (!savedSettings) return defaultStoreSettings;

		const parsedSettings: unknown = JSON.parse(savedSettings);
		const result = storeSettingsSchema.safeParse({
			...(typeof parsedSettings === 'object' && parsedSettings !== null ? parsedSettings : {}),
			lowStockThreshold: String(
				(typeof parsedSettings === 'object' && parsedSettings !== null
					? (parsedSettings as Record<string, unknown>).lowStockThreshold
					: undefined) ?? '',
			),
		});
		return result.success ? result.data : defaultStoreSettings;
	} catch {
		return defaultStoreSettings;
	}
}

export function saveStoreSettings(settings: StoreSettings): void {
	localStorage.setItem(storageKey, JSON.stringify(settings));
}