import { lazy, Suspense, useState } from 'react';
import '@/pages/Dashboard.scss';
import MetricCard, { type MetricCardProps } from '@/components/MetricCard';
import { transformOrdersForAnalytics } from '@/features/analytics/transformOrders';
import type { ReportingPeriod } from '@/features/analytics/types';
import { useOrdersQuery } from '@/features/orders/queries';

const OrderStatusChart = lazy(() => import('@/features/analytics/components/OrderStatusChart'));
const RevenueChart = lazy(() => import('@/features/analytics/components/RevenueChart'));

const reportingPeriods: { value: ReportingPeriod; label: string }[] = [
	{ value: '7d', label: 'Last 7 days' },
	{ value: '30d', label: 'Last 30 days' },
	{ value: '90d', label: 'Last 90 days' },
	{ value: '12m', label: 'Last 12 months' },
];

const metrics: MetricCardProps[] = [
	{
		icon: (
			<svg viewBox="0 0 24 24" aria-hidden="true">
				<path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
				<path d="m4.5 7.8 7.5 4.3 7.5-4.3M12 12.1V21" />
			</svg>
		),
		label: 'Total Products',
		value: 128,
		caption: 'Products in catalogue',
	},
	{
		icon: (
			<svg viewBox="0 0 24 24" aria-hidden="true">
				<path d="M3 4h2l2.2 11h10.9l2.1-7H6" />
				<circle cx="9" cy="19" r="1.4" />
				<circle cx="17" cy="19" r="1.4" />
			</svg>
		),
		label: 'Orders',
		value: 24,
		caption: 'Orders this month',
	},
	{
		icon: (
			<svg viewBox="0 0 24 24" aria-hidden="true">
				<rect x="3.5" y="5" width="17" height="14" rx="2" />
				<path d="M3.5 9h17M16 14h2" />
			</svg>
		),
		label: 'Revenue',
		value: '€2,840',
		caption: 'Revenue this month',
	},
	{
		icon: (
			<svg viewBox="0 0 24 24" aria-hidden="true">
				<path d="M10.3 4.8 3.7 16.2A1.8 1.8 0 0 0 5.3 19h13.4a1.8 1.8 0 0 0 1.6-2.8L13.7 4.8a2 2 0 0 0-3.4 0Z" />
				<path d="M12 9v4m0 3h.01" />
			</svg>
		),
		label: 'Low Stock',
		value: 7,
		caption: 'Products to review',
		tone: 'warning',
	},
];

export default function Dashboard() {
	const [period, setPeriod] = useState<ReportingPeriod>('30d');
	const ordersQuery = useOrdersQuery();
	const analytics = ordersQuery.data === undefined
		? null
		: transformOrdersForAnalytics(ordersQuery.data, period);

	return (
		<main className="dashboard">
			<section className="dashboard__metrics" aria-label="Store metrics">
				{metrics.map((metric) => (
					<MetricCard key={metric.label} {...metric} />
				))}
			</section>

			<section className="dashboard__analytics" aria-labelledby="dashboard-analytics-title">
				<header className="dashboard__analytics-header">
					<div>
						<h2 className="dashboard__analytics-title" id="dashboard-analytics-title">Order analytics</h2>
						<p className="dashboard__analytics-subtitle">Revenue and fulfillment status in the selected period.</p>
					</div>
					<label className="dashboard__period-field">
						<span>Reporting period</span>
						<select
							className="dashboard__period-select"
							value={period}
							onChange={(event) => setPeriod(event.target.value as ReportingPeriod)}
						>
							{reportingPeriods.map((option) => (
								<option key={option.value} value={option.value}>{option.label}</option>
							))}
						</select>
					</label>
				</header>
				<p className="dashboard__data-notice">
					Sample data only. These charts summarize the local demo orders and are not complete store reporting.
				</p>

				{ordersQuery.isPending ? (
					<p className="dashboard__analytics-state" role="status">Loading order analytics...</p>
				) : ordersQuery.isError ? (
					<div className="dashboard__analytics-state dashboard__analytics-state--error" role="alert">
						<p>Analytics could not be loaded. {ordersQuery.error.message}</p>
						<button type="button" onClick={() => void ordersQuery.refetch()} disabled={ordersQuery.isFetching}>
							{ordersQuery.isFetching ? 'Retrying...' : 'Retry'}
						</button>
					</div>
				) : analytics && (
					<Suspense fallback={<p className="dashboard__analytics-state" role="status">Loading charts...</p>}>
						<div className="dashboard__charts">
							<RevenueChart
								data={analytics.revenue}
								paidOrderCount={analytics.paidOrderCount}
								paidRevenue={analytics.paidRevenue}
							/>
							<OrderStatusChart data={analytics.orderStatuses} totalOrders={analytics.periodOrderCount} />
						</div>
					</Suspense>
				)}
			</section>
		</main>
	);
}
