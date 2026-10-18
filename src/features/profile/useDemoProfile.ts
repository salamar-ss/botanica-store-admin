import { useSyncExternalStore } from 'react';
import { getDemoProfileSnapshot, subscribeToDemoProfile } from '@/features/profile/profileStore';

export function useDemoProfile() {
	return useSyncExternalStore(
		subscribeToDemoProfile,
		getDemoProfileSnapshot,
		getDemoProfileSnapshot,
	);
}