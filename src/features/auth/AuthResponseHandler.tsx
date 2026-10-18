import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { apiForbiddenEvent, apiUnauthorizedEvent } from '@/api/apiClient';
import { shouldHandleUnauthorized } from '@/features/auth/authRules';
import { getDemoAuthSnapshot } from '@/features/auth/demoAuthStore';
import { useDemoAuth } from '@/features/auth/useDemoAuth';

export default function AuthResponseHandler() {
	const { logout } = useDemoAuth();
	const location = useLocation();
	const navigate = useNavigate();
	const currentLocation = useRef(location);
	const forbiddenRedirectPending = useRef(false);

	useEffect(() => {
		currentLocation.current = location;
		if (location.pathname !== '/access-denied') forbiddenRedirectPending.current = false;
	}, [location]);

	useEffect(() => {
		const handleUnauthorized = () => {
			if (!shouldHandleUnauthorized(getDemoAuthSnapshot())) return;
			logout();
		};
		const handleForbidden = () => {
			if (forbiddenRedirectPending.current || currentLocation.current.pathname === '/access-denied') return;
			forbiddenRedirectPending.current = true;
			navigate('/access-denied', {
				state: {
					from: {
						pathname: currentLocation.current.pathname,
						search: currentLocation.current.search,
						hash: currentLocation.current.hash,
					},
				},
			});
		};

		window.addEventListener(apiUnauthorizedEvent, handleUnauthorized);
		window.addEventListener(apiForbiddenEvent, handleForbidden);
		return () => {
			window.removeEventListener(apiUnauthorizedEvent, handleUnauthorized);
			window.removeEventListener(apiForbiddenEvent, handleForbidden);
		};
	}, [logout, navigate]);

	return null;
}