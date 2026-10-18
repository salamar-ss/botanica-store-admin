import type { Order, OrderStatus } from '@/features/orders/types';

export type OrderStatusFilter = OrderStatus | 'all';
export type OrderSortKey = 'date' | 'total';
export type OrderSortDirection = 'asc' | 'desc';

export interface OrderListFilters {
	search: string;
	fulfillmentStatus: OrderStatusFilter;
	dateFrom: string;
	dateTo: string;
}

export interface OrderListSort {
	key: OrderSortKey;
	direction: OrderSortDirection;
}

function getLocalDateValue(dateString: string): string {
	const date = new Date(dateString);
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');

	return `${year}-${month}-${day}`;
}

export function filterAndSortOrders(
	orders: Order[],
	filters: OrderListFilters,
	sort: OrderListSort,
): Order[] {
	const search = filters.search.trim().toLocaleLowerCase();
	const matchingOrders = orders.filter((order) => {
		const searchableText = `${order.id} #${order.id} ${order.customerName} ${order.customerEmail}`
			.toLocaleLowerCase();
		const orderDate = getLocalDateValue(order.createdAt);

		return (!search || searchableText.includes(search))
			&& (filters.fulfillmentStatus === 'all' || order.fulfillmentStatus === filters.fulfillmentStatus)
			&& (!filters.dateFrom || orderDate >= filters.dateFrom)
			&& (!filters.dateTo || orderDate <= filters.dateTo);
	});

	const direction = sort.direction === 'asc' ? 1 : -1;
	return matchingOrders.sort((left, right) => {
		const comparison = sort.key === 'date'
			? new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()
			: left.total - right.total;

		return comparison * direction;
	});
}