import type { OrderStatusDataPoint } from '@/features/analytics/types';

interface OrderStatusChartProps {
	data: OrderStatusDataPoint[];
	totalOrders: number;
}

const chart = { width: 640, height: 260, left: 148, right: 570, top: 22, rowHeight: 42, barHeight: 18 };

export default function OrderStatusChart({ data, totalOrders }: OrderStatusChartProps) {
	const maxCount = Math.max(...data.map((point) => point.count), 1);
	const summary = `${totalOrders} ${totalOrders === 1 ? 'order' : 'orders'} by fulfillment status.`;

	return (
		<section className="dashboard__chart" aria-labelledby="order-status-chart-title">
			<h3 className="dashboard__chart-title" id="order-status-chart-title">Orders by fulfillment status</h3>
			<p className="dashboard__chart-caption">Distribution of orders in the selected period.</p>
			{totalOrders === 0 ? (
				<p className="dashboard__chart-empty" role="status">No orders in this reporting period.</p>
			) : (
				<>
					<svg
						className="dashboard__chart-svg"
						viewBox={`0 0 ${chart.width} ${chart.height}`}
						role="img"
						aria-labelledby="order-status-chart-title order-status-chart-description"
					>
						<desc id="order-status-chart-description">{summary} {data.map((point) => `${point.status}: ${point.count}`).join(', ')}.</desc>
						{data.map((point, index) => {
							const y = chart.top + index * chart.rowHeight;
							const barWidth = point.count / maxCount * (chart.right - chart.left);
							return (
								<g key={point.status}>
									<text className="dashboard__status-label" x="8" y={y + 14}>{point.status}</text>
									<rect className="dashboard__status-track" x={chart.left} y={y} width={chart.right - chart.left} height={chart.barHeight} rx="4" />
									<rect
										className={`dashboard__status-bar dashboard__status-bar--${point.status.toLowerCase()}`}
										x={chart.left}
										y={y}
										width={barWidth}
										height={chart.barHeight}
										rx="4"
									/>
									<text className="dashboard__status-count" x={chart.right + 14} y={y + 14}>{point.count}</text>
								</g>
							);
						})}
					</svg>
					<ul className="dashboard__status-summary" aria-label="Order counts by status">
						{data.map((point) => (
							<li key={point.status}>
								<span>{point.status}</span>
								<strong>{point.count} ({Math.round(point.share * 100)}%)</strong>
							</li>
						))}
					</ul>
				</>
			)}
		</section>
	);
}