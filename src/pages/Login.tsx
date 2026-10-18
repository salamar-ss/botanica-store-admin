import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { resolveLoginDestination } from '@/features/auth/authRules';
import { useDemoAuth } from '@/features/auth/useDemoAuth';
import '@/pages/Login.scss';

export default function Login() {
	const { status, startDemoSession } = useDemoAuth();
	const location = useLocation();
	const navigate = useNavigate();
	const [error, setError] = useState<string | null>(null);
	const destination = resolveLoginDestination(location.state);

	if (status === 'checking') {
		return <main className="login-page__state" role="status">Checking demo session...</main>;
	}
	if (status === 'authenticated') return <Navigate to={destination} replace />;

	const beginDemo = () => {
		setError(null);
		try {
			startDemoSession();
			navigate(destination, { replace: true });
		} catch {
			setError('A demo session could not be started in this browser.');
		}
	};

	return (
		<main className="login-page" aria-labelledby="login-page-title">
			<div className="login-page__content">
				<p className="login-page__eyebrow">Botanica Admin</p>
				<h1 className="login-page__title" id="login-page-title">Demo sign-in</h1>
				<p className="login-page__copy">Continue to the portfolio dashboard demo.</p>
				<p className="login-page__notice">
					No credentials are checked. This only opens the demo interface; it does not authenticate you or protect API data.
				</p>
				{error && <p className="login-page__error" role="alert">{error}</p>}
				<button className="login-page__submit" type="button" onClick={beginDemo}>
					Continue as demo user
				</button>
			</div>
		</main>
	);
}