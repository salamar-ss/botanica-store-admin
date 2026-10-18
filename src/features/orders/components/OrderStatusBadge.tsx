import type { FulfillmentStatus, PaymentStatus } from '@/features/orders/types';
import '@/features/orders/components/OrderStatusBadge.scss';

type OrderStatusBadgeProps =
	| { type: 'payment'; status: PaymentStatus }
	| { type: 'fulfillment'; status: FulfillmentStatus };

export default function OrderStatusBadge({ type, status }: OrderStatusBadgeProps) {
	return (
		<span className={`order-status-badge order-status-badge--${type}-${status.toLowerCase()}`}>
			{status}
		</span>
	);
}