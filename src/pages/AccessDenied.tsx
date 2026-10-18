import { Link } from 'react-router-dom';
import '@/pages/AccessDenied.scss';

export default function AccessDenied() {
	return (
		<main className="access-denied-page" aria-labelledby="access-denied-title">
			<h2 className="access-denied-page__title" id="access-denied-title">Access denied</h2>
			<p className="access-denied-page__message">
				The API denied this request (403). Your demo session is still active.
			</p>
			<Link className="access-denied-page__link" to="/dashboard">Return to dashboard</Link>
		</main>
	);
}