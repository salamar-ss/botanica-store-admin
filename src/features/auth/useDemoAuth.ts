import { createContext, useContext } from 'react';
import type { DemoAuthStatus } from '@/features/auth/authRules';

export interface DemoAuthContextValue {
	status: DemoAuthStatus;
	startDemoSession: () => void;
	logout: () => void;
}

export const DemoAuthContext = createContext<DemoAuthContextValue | null>(null);

export function useDemoAuth(): DemoAuthContextValue {
	const context = useContext(DemoAuthContext);
	if (!context) throw new Error('useDemoAuth must be used inside DemoAuthProvider.');
	return context;
}