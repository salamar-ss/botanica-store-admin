import {
	demoSessionStorageKey,
	restoreDemoAuthStatus,
	type DemoAuthStatus,
} from '@/features/auth/authRules';

type Listener = () => void;

const listeners = new Set<Listener>();
let currentStatus: DemoAuthStatus = 'checking';

function updateStatus(status: DemoAuthStatus) {
	if (currentStatus === status) return;
	currentStatus = status;
	for (const listener of listeners) listener();
}

export function subscribeToDemoAuth(listener: Listener): () => void {
	listeners.add(listener);
	return () => listeners.delete(listener);
}

export function getDemoAuthSnapshot(): DemoAuthStatus {
	return currentStatus;
}

export function restoreDemoSession(): void {
	let storage: Storage | null = null;
	try {
		if (typeof window !== 'undefined') storage = window.sessionStorage;
	} catch {
		storage = null;
	}
	updateStatus(restoreDemoAuthStatus(storage));
}

export function startDemoSession(): void {
	if (typeof window === 'undefined') throw new Error('Demo sessions require a browser.');
	window.sessionStorage.setItem(demoSessionStorageKey, 'active');
	updateStatus('authenticated');
}

export function endDemoSession(): void {
	try {
		if (typeof window !== 'undefined') window.sessionStorage.removeItem(demoSessionStorageKey);
	} catch {
		// The in-memory demo state still needs to end if browser storage is unavailable.
	}
	updateStatus('unauthenticated');
}