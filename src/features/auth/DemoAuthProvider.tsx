import { useCallback, useEffect, useMemo, useSyncExternalStore, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { endDemoSession, getDemoAuthSnapshot, restoreDemoSession, startDemoSession, subscribeToDemoAuth } from '@/features/auth/demoAuthStore';
import { DemoAuthContext } from '@/features/auth/useDemoAuth';

interface DemoAuthProviderProps {
	children: ReactNode;
}

export function DemoAuthProvider({ children }: DemoAuthProviderProps) {
	const queryClient = useQueryClient();
	const status = useSyncExternalStore(subscribeToDemoAuth, getDemoAuthSnapshot, getDemoAuthSnapshot);

	useEffect(() => {
		restoreDemoSession();
	}, []);

	const startSession = useCallback(() => startDemoSession(), []);
	const logout = useCallback(() => {
		endDemoSession();
		queryClient.clear();
	}, [queryClient]);
	const value = useMemo(() => ({ status, startDemoSession: startSession, logout }), [status, startSession, logout]);

	return <DemoAuthContext.Provider value={value}>{children}</DemoAuthContext.Provider>;
}