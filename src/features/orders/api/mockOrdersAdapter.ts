import { canTransitionOrderStatus } from '@/features/orders/orderStatus';
import type { Order, UpdateOrderStatusInput } from '@/features/orders/types';

const mockOrders: Order[] = [
	{
		id: 'ORD-2048',
		customerName: 'Maya Bennett',
		customerEmail: 'maya.bennett@example.com',
		createdAt: '2026-10-16T09:24:00.000Z',
		items: [
			{ productId: 'BOT-101', title: 'Calendula Face Cream', quantity: 2, unitPrice: 24 },
			{ productId: 'BOT-114', title: 'Rosehip Facial Oil', quantity: 1, unitPrice: 32 },
		],
		total: 80,
		paymentStatus: 'Paid',
		fulfillmentStatus: 'Processing',
	},
	{
		id: 'ORD-2047',
		customerName: 'Jonah Patel',
		customerEmail: 'jonah.patel@example.com',
		createdAt: '2026-10-15T14:08:00.000Z',
		items: [{ productId: 'BOT-108', title: 'Lavender Body Wash', quantity: 1, unitPrice: 19.5 }],
		total: 19.5,
		paymentStatus: 'Paid',
		fulfillmentStatus: 'Shipped',
	},
	{
		id: 'ORD-2046',
		customerName: 'Elena Fischer',
		customerEmail: 'elena.fischer@example.com',
		createdAt: '2026-10-14T11:42:00.000Z',
		items: [
			{ productId: 'BOT-103', title: 'Oat & Honey Cleanser', quantity: 2, unitPrice: 18 },
			{ productId: 'BOT-121', title: 'Chamomile Hand Balm', quantity: 3, unitPrice: 12 },
		],
		total: 72,
		paymentStatus: 'Paid',
		fulfillmentStatus: 'Delivered',
	},
	{
		id: 'ORD-2045',
		customerName: 'Theo Martin',
		customerEmail: 'theo.martin@example.com',
		createdAt: '2026-10-13T16:17:00.000Z',
		items: [{ productId: 'BOT-116', title: 'Nettle Scalp Tonic', quantity: 1, unitPrice: 27 }],
		total: 27,
		paymentStatus: 'Pending',
		fulfillmentStatus: 'Pending',
	},
	{
		id: 'ORD-2044',
		customerName: 'Priya Okafor',
		customerEmail: 'priya.okafor@example.com',
		createdAt: '2026-10-12T08:53:00.000Z',
		items: [
			{ productId: 'BOT-109', title: 'Green Tea Daily Moisturizer', quantity: 1, unitPrice: 29 },
			{ productId: 'BOT-118', title: 'Citrus Botanical Soap', quantity: 2, unitPrice: 9.5 }],
		total: 48,
		paymentStatus: 'Refunded',
		fulfillmentStatus: 'Cancelled',
	},
	{
		id: 'ORD-2043',
		customerName: 'Amara Lewis',
		customerEmail: 'amara.lewis@example.com',
		createdAt: '2026-10-11T10:31:00.000Z',
		items: [{ productId: 'BOT-105', title: 'Aloe & Cucumber Gel', quantity: 1, unitPrice: 22 }],
		total: 22,
		paymentStatus: 'Paid',
		fulfillmentStatus: 'Delivered',
	},
	{
		id: 'ORD-2042',
		customerName: 'Lucas Chen',
		customerEmail: 'lucas.chen@example.com',
		createdAt: '2026-10-10T13:06:00.000Z',
		items: [{ productId: 'BOT-112', title: 'Rosewater Toner', quantity: 2, unitPrice: 16 }],
		total: 32,
		paymentStatus: 'Pending',
		fulfillmentStatus: 'Processing',
	},
	{
		id: 'ORD-2041',
		customerName: 'Sofia Andersson',
		customerEmail: 'sofia.andersson@example.com',
		createdAt: '2026-10-09T07:48:00.000Z',
		items: [{ productId: 'BOT-120', title: 'Calendula Lip Balm', quantity: 3, unitPrice: 8 }],
		total: 24,
		paymentStatus: 'Paid',
		fulfillmentStatus: 'Shipped',
	},
];

export async function getMockOrders(): Promise<Order[]> {
	return mockOrders.map((order) => ({ ...order }));
}

export async function getMockOrder(orderId: string): Promise<Order | null> {
	const orders = await getMockOrders();
	return orders.find((order) => order.id === orderId) ?? null;
}

export async function updateMockOrderStatus({ orderId, currentStatus, status }: UpdateOrderStatusInput): Promise<Order> {
	const order = await getMockOrder(orderId);
	if (!order) {
		throw new Error(`Order ${orderId} was not found.`);
	}
	if (!canTransitionOrderStatus(currentStatus, status)) {
		throw new Error(`Cannot change order status from ${currentStatus} to ${status}.`);
	}

	return { ...order, fulfillmentStatus: status };
}