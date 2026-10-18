import { describe, expect, it } from 'vitest';
import { transformOrdersForAnalytics } from '@/features/analytics/transformOrders';
import { filterAndSortOrders } from '@/features/orders/orderList';
import { canTransitionOrderStatus, getValidOrderStatusTransitions } from '@/features/orders/orderStatus';
import type { Order, OrderStatus } from '@/features/orders/types';

function localDateIso(day: number): string {
	return new Date(2026, 9, day, 12).toISOString();
}

function makeOrder(overrides: Partial<Order> & Pick<Order, 'id'>): Order {
	return {
		customerName: 'Demo Customer',
		customerEmail: 'demo@example.com',
		createdAt: localDateIso(16),
		items: [],
		total: 0,
		paymentStatus: 'Paid',
		fulfillmentStatus: 'Processing',
		...overrides,
	};
}

describe('order list rules', () => {
	const orders = [
		makeOrder({ id: 'ORD-2', customerName: 'Maya Quinn', createdAt: localDateIso(16), total: 30 }),
		makeOrder({ id: 'ORD-1', customerName: 'Noah Lee', createdAt: localDateIso(15), total: 80, fulfillmentStatus: 'Shipped' }),
		makeOrder({ id: 'ORD-3', customerName: 'Maya Quinn', createdAt: localDateIso(14), total: 12, fulfillmentStatus: 'Delivered' }),
	];

	it('searches order number and customer without case sensitivity', () => {
		const defaults = { fulfillmentStatus: 'all' as const, dateFrom: '', dateTo: '' };
		expect(filterAndSortOrders(orders, { ...defaults, search: ' ord-1 ' }, { key: 'date', direction: 'desc' })
			.map((order) => order.id)).toEqual(['ORD-1']);
		expect(filterAndSortOrders(orders, { ...defaults, search: 'MAYA' }, { key: 'date', direction: 'desc' })
			.map((order) => order.id)).toEqual(['ORD-2', 'ORD-3']);
	});

	it('combines inclusive date range and fulfillment filter', () => {
		const result = filterAndSortOrders(orders, {
			search: '',
			fulfillmentStatus: 'Shipped',
			dateFrom: '2026-10-15',
			dateTo: '2026-10-15',
		}, { key: 'date', direction: 'asc' });

		expect(result.map((order) => order.id)).toEqual(['ORD-1']);
	});

	it('sorts dates and totals in both directions', () => {
		const filters = { search: '', fulfillmentStatus: 'all' as const, dateFrom: '', dateTo: '' };
		expect(filterAndSortOrders(orders, filters, { key: 'date', direction: 'asc' })
			.map((order) => order.id)).toEqual(['ORD-3', 'ORD-1', 'ORD-2']);
		expect(filterAndSortOrders(orders, filters, { key: 'total', direction: 'desc' })
			.map((order) => order.total)).toEqual([80, 30, 12]);
	});
});

describe('order analytics calculations', () => {
	const referenceDate = new Date(2026, 9, 17, 12);

	it('includes period boundaries and fulfillment statuses but counts only paid revenue', () => {
		const orders = [
			makeOrder({ id: 'start', createdAt: localDateIso(11), total: 10, fulfillmentStatus: 'Pending' }),
			makeOrder({ id: 'pending', createdAt: localDateIso(16), total: 50, paymentStatus: 'Pending', fulfillmentStatus: 'Processing' }),
			makeOrder({ id: 'refunded', createdAt: localDateIso(16), total: 40, paymentStatus: 'Refunded', fulfillmentStatus: 'Cancelled' }),
			makeOrder({ id: 'prior', createdAt: localDateIso(10), total: 70 }),
			makeOrder({ id: 'future', createdAt: localDateIso(18), total: 90 }),
			makeOrder({ id: 'invalid', createdAt: 'not-a-date', total: 100 }),
		];
		const analytics = transformOrdersForAnalytics(orders, '7d', referenceDate);

		expect(analytics.periodOrderCount).toBe(3);
		expect(analytics.paidOrderCount).toBe(1);
		expect(analytics.paidRevenue).toBe(10);
		expect(analytics.orderStatuses.map(({ status, count }) => [status, count])).toEqual([
			['Pending', 1],
			['Processing', 1],
			['Shipped', 0],
			['Delivered', 0],
			['Cancelled', 1],
		]);
		expect(analytics.orderStatuses.reduce((total, point) => total + point.share, 0)).toBe(1);
		expect(analytics.revenue).toHaveLength(7);
		expect(analytics.revenue.reduce((total, point) => total + point.revenue, 0)).toBe(10);
	});

	it('returns zeroed series for empty data and twelve monthly buckets for a year', () => {
		const analytics = transformOrdersForAnalytics([], '12m', referenceDate);

		expect(analytics.periodOrderCount).toBe(0);
		expect(analytics.paidRevenue).toBe(0);
		expect(analytics.revenue).toHaveLength(12);
		expect(analytics.revenue.every((point) => point.revenue === 0)).toBe(true);
		expect(analytics.orderStatuses.every((point) => point.count === 0 && point.share === 0)).toBe(true);
	});
});

describe('order status transitions', () => {
	const validTransitions: [OrderStatus, OrderStatus][] = [
		['Pending', 'Processing'],
		['Pending', 'Cancelled'],
		['Processing', 'Shipped'],
		['Processing', 'Cancelled'],
		['Shipped', 'Delivered'],
	];

	it.each(validTransitions)('allows %s to %s', (current, next) => {
		expect(canTransitionOrderStatus(current, next)).toBe(true);
	});

	it.each([
		['Pending', 'Delivered'],
		['Processing', 'Pending'],
		['Shipped', 'Cancelled'],
		['Delivered', 'Cancelled'],
		['Cancelled', 'Processing'],
	] as [OrderStatus, OrderStatus][])('blocks %s to %s', (current, next) => {
		expect(canTransitionOrderStatus(current, next)).toBe(false);
	});

	it('exposes terminal statuses with no allowed next steps', () => {
		expect(getValidOrderStatusTransitions('Delivered')).toEqual([]);
		expect(getValidOrderStatusTransitions('Cancelled')).toEqual([]);
	});
});