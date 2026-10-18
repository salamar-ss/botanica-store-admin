export const currencyCodes = ['EUR', 'USD', 'GBP', 'CAD', 'AUD', 'JPY'] as const;
export type StoreCurrency = (typeof currencyCodes)[number];

export const currencyOptions: { value: StoreCurrency; label: string }[] = [
	{ value: 'EUR', label: 'Euro (EUR)' },
	{ value: 'USD', label: 'US dollar (USD)' },
	{ value: 'GBP', label: 'Pound sterling (GBP)' },
	{ value: 'CAD', label: 'Canadian dollar (CAD)' },
	{ value: 'AUD', label: 'Australian dollar (AUD)' },
	{ value: 'JPY', label: 'Japanese yen (JPY)' },
];

export const storeTimeZones = [
	'UTC',
	'Europe/Dublin',
	'Europe/London',
	'Europe/Paris',
	'America/New_York',
	'America/Los_Angeles',
	'Asia/Tokyo',
] as const;
export type StoreTimeZone = (typeof storeTimeZones)[number];

export const timeZoneOptions: { value: StoreTimeZone; label: string }[] = [
	{ value: 'UTC', label: 'UTC' },
	{ value: 'Europe/Dublin', label: 'Europe/Dublin' },
	{ value: 'Europe/London', label: 'Europe/London' },
	{ value: 'Europe/Paris', label: 'Europe/Paris' },
	{ value: 'America/New_York', label: 'America/New_York' },
	{ value: 'America/Los_Angeles', label: 'America/Los_Angeles' },
	{ value: 'Asia/Tokyo', label: 'Asia/Tokyo' },
];

export interface StoreSettings {
	storeName: string;
	currency: StoreCurrency;
	timeZone: StoreTimeZone;
	lowStockThreshold: number;
}

export const defaultStoreSettings: StoreSettings = {
	storeName: 'Botanica',
	currency: 'EUR',
	timeZone: 'Europe/Dublin',
	lowStockThreshold: 7,
};