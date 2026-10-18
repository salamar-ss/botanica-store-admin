import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { getProtectedRouteDecision } from '@/features/auth/authRules';
import { useDemoAuth } from '@/features/auth/useDemoAuth';

export default function DemoProtectedRoute() {
	const { status } = useDemoAuth();
	const location = useLocation();
	const decision = getProtectedRouteDecision(status, {
		pathname: location.pathname,
		search: location.search,
		hash: location.hash,
	});

	if (decision.kind === 'checking') {
		return <main className="demo-auth-state" role="status">Restoring demo session...</main>;
	}
	if (decision.kind === 'redirect') {
		return <Navigate to="/login" replace state={decision.state} />;
	}
	return <Outlet />;
}