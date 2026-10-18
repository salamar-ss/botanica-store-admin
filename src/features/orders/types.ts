export type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
export type FulfillmentStatus = OrderStatus;
export type PaymentStatus = 'Paid' | 'Pending' | 'Refunded';

export interface OrderItem {
	productId: string;
	title: string;
	quantity: number;
	unitPrice: number;
}

export interface Order {
	id: string;
	customerName: string;
	customerEmail: string;
	createdAt: string;
	items: OrderItem[];
	total: number;
	paymentStatus: PaymentStatus;
	fulfillmentStatus: FulfillmentStatus;
}

export interface UpdateOrderStatusInput {
	orderId: string;
	currentStatus: FulfillmentStatus;
	status: FulfillmentStatus;
}