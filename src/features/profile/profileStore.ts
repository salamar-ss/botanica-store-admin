import { demoProfileSchema } from '@/features/profile/schema';
import { defaultDemoProfile, type DemoProfile } from '@/features/profile/types';

const storageKey = 'botanica-admin-demo-profile';
const listeners = new Set<() => void>();

function readStoredProfile(): DemoProfile {
	try {
		if (typeof window === 'undefined') return defaultDemoProfile;
		const storedProfile = window.localStorage.getItem(storageKey);
		if (!storedProfile) return defaultDemoProfile;

		const parsedProfile: unknown = JSON.parse(storedProfile);
		const result = demoProfileSchema.safeParse(parsedProfile);
		return result.success ? result.data : defaultDemoProfile;
	} catch {
		return defaultDemoProfile;
	}
}

let currentProfile = readStoredProfile();

function notifySubscribers() {
	for (const listener of listeners) listener();
}

function handleStorageChange(event: StorageEvent) {
	if (event.key !== storageKey && event.key !== null) return;
	currentProfile = readStoredProfile();
	notifySubscribers();
}

export function subscribeToDemoProfile(listener: () => void): () => void {
	listeners.add(listener);
	if (listeners.size === 1 && typeof window !== 'undefined') {
		window.addEventListener('storage', handleStorageChange);
	}

	return () => {
		listeners.delete(listener);
		if (listeners.size === 0 && typeof window !== 'undefined') {
			window.removeEventListener('storage', handleStorageChange);
		}
	};
}

export function getDemoProfileSnapshot(): DemoProfile {
	return currentProfile;
}

export function saveDemoProfile(profile: DemoProfile): void {
	const validatedProfile = demoProfileSchema.parse(profile);
	if (typeof window === 'undefined') throw new Error('Browser storage is unavailable.');

	window.localStorage.setItem(storageKey, JSON.stringify(validatedProfile));
	currentProfile = validatedProfile;
	notifySubscribers();
}