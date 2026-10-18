import { formatOrderCurrency } from '@/features/orders/formatters';
import type { RevenueDataPoint } from '@/features/analytics/types';

interface RevenueChartProps {
	data: RevenueDataPoint[];
	paidOrderCount: number;
	paidRevenue: number;
}

const chartCurrencyFormatter = new Intl.NumberFormat('en-IE', {
	style: 'currency',
	currency: 'EUR',
	maximumFractionDigits: 0,
});

const chart = { width: 640, height: 270, left: 82, right: 620, top: 20, bottom: 216 };

export default function RevenueChart({ data, paidOrderCount, paidRevenue }: RevenueChartProps) {
	const maxValue = Math.max(...data.map((point) => point.revenue), 0);
	const axisMax = maxValue === 0 ? 1 : maxValue * 1.15;
	const yTicks = Array.from({ length: 5 }, (_, index) => axisMax * (1 - index / 4));
	const points = data.map((point, index) => {
		const x = chart.left + (data.length <= 1 ? 0 : index * (chart.right - chart.left) / (data.length - 1));
		const y = chart.bottom - point.revenue / axisMax * (chart.bottom - chart.top);
		return { ...point, x, y };
	});
	const summary = `${paidOrderCount} paid ${paidOrderCount === 1 ? 'order' : 'orders'} contributed ${formatOrderCurrency(paidRevenue)} in the selected period.`;

	return (
		<section className="dashboard__chart" aria-labelledby="revenue-chart-title">
			<h3 className="dashboard__chart-title" id="revenue-chart-title">Paid revenue over time</h3>
			<p className="dashboard__chart-caption">Only orders marked Paid are included.</p>
			{paidOrderCount === 0 ? (
				<p className="dashboard__chart-empty" role="status">No paid orders in this reporting period.</p>
			) : (
				<>
					<svg
						className="dashboard__chart-svg"
						viewBox={`0 0 ${chart.width} ${chart.height}`}
						role="img"
						aria-labelledby="revenue-chart-title revenue-chart-description"
					>
						<desc id="revenue-chart-description">{summary} Values are grouped by reporting period.</desc>
						{yTicks.map((tick, index) => {
							const y = chart.top + index * (chart.bottom - chart.top) / 4;
							return (
								<g key={tick}>
									<line className="dashboard__chart-gridline" x1={chart.left} x2={chart.right} y1={y} y2={y} />
									<text className="dashboard__chart-axis-label" x={chart.left - 10} y={y + 4} textAnchor="end">
										{chartCurrencyFormatter.format(tick)}
									</text>
								</g>
							);
						})}
						<polyline
							className="dashboard__revenue-line"
							points={points.map((point) => `${point.x},${point.y}`).join(' ')}
						/>
						{points.map((point) => (
							<g key={point.dateKey}>
								<circle className="dashboard__revenue-point" cx={point.x} cy={point.y} r="4" />
								<text className="dashboard__chart-date-label" x={point.x} y={chart.bottom + 23} textAnchor="middle">
									{point.label}
								</text>
							</g>
						))}
					</svg>
					<p className="dashboard__chart-summary" aria-live="polite">{summary}</p>
				</>
			)}
		</section>
	);
}