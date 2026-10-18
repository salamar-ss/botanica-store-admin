import { Link } from 'react-router-dom';
import '@/pages/PlaceholderPage.scss';

interface PlaceholderPageProps {
	title: string;
	message: string;
	action?: {
		label: string;
		to: string;
	};
}

export default function PlaceholderPage({ title, message, action }: PlaceholderPageProps) {
	return (
		<section className="placeholder-page" aria-labelledby="placeholder-page-title">
			<h2 className="placeholder-page__title" id="placeholder-page-title">
				{title}
			</h2>
			<p className="placeholder-page__message">{message}</p>
			{action && (
				<Link className="placeholder-page__action" to={action.to}>
					{action.label}
				</Link>
			)}
		</section>
	);
}