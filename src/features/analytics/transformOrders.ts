import type { Order, OrderStatus } from '@/features/orders/types';
import type { DashboardAnalyticsData, ReportingPeriod, RevenueDataPoint } from '@/features/analytics/types';

const statusOrder: OrderStatus[] = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
const dayMilliseconds = 24 * 60 * 60 * 1000;
const shortDateFormatter = new Intl.DateTimeFormat('en-IE', { day: 'numeric', month: 'short' });
const shortMonthFormatter = new Intl.DateTimeFormat('en-IE', { month: 'short', year: '2-digit' });

function startOfDay(date: Date): Date {
	return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number): Date {
	const result = new Date(date);
	result.setDate(result.getDate() + days);
	return result;
}

function dayOrdinal(date: Date): number {
	return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / dayMilliseconds;
}

function dateKey(date: Date): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}

function getBucketStarts(period: ReportingPeriod, today: Date): { start: Date; bucketDays: number; dates: Date[] } {
	if (period === '12m') {
		const start = new Date(today.getFullYear(), today.getMonth() - 11, 1);
		const dates = Array.from({ length: 12 }, (_, index) =>
			new Date(start.getFullYear(), start.getMonth() + index, 1),
		);
		return { start, bucketDays: 0, dates };
	}

	const periodDays = period === '7d' ? 7 : period === '30d' ? 30 : 90;
	const bucketDays = period === '7d' ? 1 : period === '30d' ? 7 : 14;
	const start = addDays(today, 1 - periodDays);
	const bucketCount = Math.ceil(periodDays / bucketDays);
	const dates = Array.from({ length: bucketCount }, (_, index) => addDays(start, index * bucketDays));
	return { start, bucketDays, dates };
}

function getBucketIndex(date: Date, period: ReportingPeriod, start: Date, bucketDays: number): number {
	if (period === '12m') {
		return (date.getFullYear() - start.getFullYear()) * 12 + date.getMonth() - start.getMonth();
	}

	return Math.floor((dayOrdinal(date) - dayOrdinal(start)) / bucketDays);
}

function createRevenuePoint(date: Date, period: ReportingPeriod): RevenueDataPoint {
	return {
		dateKey: dateKey(date),
		label: period === '12m' ? shortMonthFormatter.format(date) : shortDateFormatter.format(date),
		revenue: 0,
	};
}

export function transformOrdersForAnalytics(
	orders: Order[],
	period: ReportingPeriod,
	referenceDate = new Date(),
): DashboardAnalyticsData {
	const today = startOfDay(referenceDate);
	const { start, bucketDays, dates } = getBucketStarts(period, today);
	const periodOrders = orders.filter((order) => {
		const orderDate = new Date(order.createdAt);
		if (!Number.isFinite(orderDate.getTime())) return false;
		const orderDay = startOfDay(orderDate);
		return dayOrdinal(orderDay) >= dayOrdinal(start) && dayOrdinal(orderDay) <= dayOrdinal(today);
	});
	const revenue = dates.map((date) => createRevenuePoint(date, period));
	const paidOrders = periodOrders.filter((order) => order.paymentStatus === 'Paid');

	for (const order of paidOrders) {
		const orderDate = startOfDay(new Date(order.createdAt));
		const bucketIndex = getBucketIndex(orderDate, period, start, bucketDays);
		const bucket = revenue[bucketIndex];
		if (bucket) bucket.revenue += order.total;
	}

	const orderStatuses = statusOrder.map((status) => {
		const count = periodOrders.filter((order) => order.fulfillmentStatus === status).length;
		return {
			status,
			count,
			share: periodOrders.length === 0 ? 0 : count / periodOrders.length,
		};
	});

	return {
		periodOrderCount: periodOrders.length,
		paidOrderCount: paidOrders.length,
		paidRevenue: paidOrders.reduce((total, order) => total + order.total, 0),
		revenue,
		orderStatuses,
	};
}