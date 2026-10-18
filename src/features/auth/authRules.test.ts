import { describe, expect, it } from 'vitest';
import {
	classifyApiStatus,
	demoSessionStorageKey,
	getProtectedRouteDecision,
	resolveLoginDestination,
	restoreDemoAuthStatus,
	shouldHandleUnauthorized,
} from '@/features/auth/authRules';

describe('demo authentication rules', () => {
	it('restores only the demo session marker from session storage', () => {
		expect(restoreDemoAuthStatus({ getItem: (key) => key === demoSessionStorageKey ? 'active' : null }))
			.toBe('authenticated');
		expect(restoreDemoAuthStatus({ getItem: () => null })).toBe('unauthenticated');
		expect(restoreDemoAuthStatus({ getItem: () => { throw new Error('storage unavailable'); } }))
			.toBe('unauthenticated');
	});

	it('keeps protected content in a checking state and redirects unauthenticated users with their destination', () => {
		const destination = { pathname: '/orders/ORD-42', search: '?view=items', hash: '#summary' };

		expect(getProtectedRouteDecision('checking', destination)).toEqual({ kind: 'checking' });
		expect(getProtectedRouteDecision('unauthenticated', destination)).toEqual({
			kind: 'redirect',
			state: { from: destination },
		});
		expect(getProtectedRouteDecision('authenticated', destination)).toEqual({ kind: 'allow' });
	});

	it('restores an internal intended destination after demo sign-in and rejects external paths', () => {
		expect(resolveLoginDestination({ from: { pathname: '/orders/ORD-42', search: '?view=items', hash: '#summary' } }))
			.toBe('/orders/ORD-42?view=items#summary');
		expect(resolveLoginDestination({ from: { pathname: '//example.com/path' } })).toBe('/dashboard');
		expect(resolveLoginDestination({ from: { pathname: '/login' } })).toBe('/dashboard');
		expect(resolveLoginDestination(undefined)).toBe('/dashboard');
	});

	it('treats 401 as unauthenticated and 403 as access denied, not logout', () => {
		expect(classifyApiStatus(401)).toBe('unauthenticated');
		expect(classifyApiStatus(403)).toBe('access-denied');
		expect(classifyApiStatus(500)).toBeUndefined();
		expect(shouldHandleUnauthorized('authenticated')).toBe(true);
		expect(shouldHandleUnauthorized('unauthenticated')).toBe(false);
	});
});