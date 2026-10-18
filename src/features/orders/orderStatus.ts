import type { OrderStatus } from '@/features/orders/types';

export const validOrderStatusTransitions: Readonly<Record<OrderStatus, readonly OrderStatus[]>> = {
	Pending: ['Processing', 'Cancelled'],
	Processing: ['Shipped', 'Cancelled'],
	Shipped: ['Delivered'],
	Delivered: [],
	Cancelled: [],
};

export function getValidOrderStatusTransitions(status: OrderStatus): readonly OrderStatus[] {
	return validOrderStatusTransitions[status];
}

export function canTransitionOrderStatus(currentStatus: OrderStatus, nextStatus: OrderStatus): boolean {
	return validOrderStatusTransitions[currentStatus].includes(nextStatus);
}