export const demoSessionStorageKey = 'botanica-admin-demo-session';

export type DemoAuthStatus = 'checking' | 'authenticated' | 'unauthenticated';
export type ApiAuthDisposition = 'unauthenticated' | 'access-denied';

export interface DemoRouteLocation {
	pathname: string;
	search?: string;
	hash?: string;
}

export interface DemoSessionStorageReader {
	getItem: (key: string) => string | null;
}

export type ProtectedRouteDecision =
	| { kind: 'checking' }
	| { kind: 'allow' }
	| { kind: 'redirect'; state: { from: DemoRouteLocation } };

export function restoreDemoAuthStatus(storage: DemoSessionStorageReader | null): DemoAuthStatus {
	try {
		return storage?.getItem(demoSessionStorageKey) === 'active' ? 'authenticated' : 'unauthenticated';
	} catch {
		return 'unauthenticated';
	}
}

export function getProtectedRouteDecision(
	status: DemoAuthStatus,
	location: DemoRouteLocation,
): ProtectedRouteDecision {
	if (status === 'checking') return { kind: 'checking' };
	if (status === 'authenticated') return { kind: 'allow' };
	return { kind: 'redirect', state: { from: location } };
}

export function resolveLoginDestination(state: unknown): string {
	if (typeof state !== 'object' || state === null || !('from' in state)) return '/dashboard';
	const from = state.from;
	if (typeof from !== 'object' || from === null || !('pathname' in from)) return '/dashboard';
	const { pathname } = from;
	if (
		typeof pathname !== 'string'
		|| !pathname.startsWith('/')
		|| pathname.startsWith('//')
		|| pathname.includes('\\')
		|| pathname === '/login'
	) {
		return '/dashboard';
	}
	const search = 'search' in from && typeof from.search === 'string' && from.search.startsWith('?') ? from.search : '';
	const hash = 'hash' in from && typeof from.hash === 'string' && from.hash.startsWith('#') ? from.hash : '';
	return `${pathname}${search}${hash}`;
}

export function classifyApiStatus(status: number | undefined): ApiAuthDisposition | undefined {
	if (status === 401) return 'unauthenticated';
	if (status === 403) return 'access-denied';
	return undefined;
}

export function shouldHandleUnauthorized(status: DemoAuthStatus): boolean {
	return status !== 'unauthenticated';
}