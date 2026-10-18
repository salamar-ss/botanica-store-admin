import type { ReactNode } from 'react';
import '@/components/MetricCard.scss';

export interface MetricCardProps {
	icon: ReactNode;
	label: string;
	value: string | number;
	caption: string;
	tone?: 'default' | 'warning';
}

export default function MetricCard({
	icon,
	label,
	value,
	caption,
	tone = 'default',
}: MetricCardProps) {
	return (
		<article className={`metric-card${tone === 'warning' ? ' metric-card--warning' : ''}`}>
			<span className="metric-card__icon">{icon}</span>
			<h2 className="metric-card__label">{label}</h2>
			<p className="metric-card__value">{value}</p>
			<p className="metric-card__caption">{caption}</p>
		</article>
	);
}