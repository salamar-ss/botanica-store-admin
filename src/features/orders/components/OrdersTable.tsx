import { Link } from 'react-router-dom';
import OrderStatusBadge from '@/features/orders/components/OrderStatusBadge';
import { formatOrderCurrency, formatOrderDate } from '@/features/orders/formatters';
import type { Order } from '@/features/orders/types';

interface OrdersTableProps {
	orders: Order[];
	sortKey: 'date' | 'total';
	sortDirection: 'asc' | 'desc';
	onSort: (key: 'date' | 'total') => void;
}

export default function OrdersTable({ orders, sortKey, sortDirection, onSort }: OrdersTableProps) {
	const getSortLabel = (key: 'date' | 'total') => {
		if (sortKey !== key) return 'none';
		return sortDirection === 'asc' ? 'ascending' : 'descending';
	};

	return (
		<div className="orders-page__table-wrap">
			<table className="orders-page__table">
				<caption className="orders-page__caption">Orders with customer, date, total, payment, and fulfillment status</caption>
				<thead>
					<tr>
						<th scope="col">Order</th>
						<th scope="col">Customer</th>
						<th scope="col" aria-sort={getSortLabel('date')}>
							<button className="orders-page__sort-button" type="button" onClick={() => onSort('date')}>
								Date <span aria-hidden="true">{sortKey === 'date' ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}</span>
							</button>
						</th>
						<th scope="col" aria-sort={getSortLabel('total')}>
							<button className="orders-page__sort-button" type="button" onClick={() => onSort('total')}>
								Total <span aria-hidden="true">{sortKey === 'total' ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}</span>
							</button>
						</th>
						<th scope="col">Payment status</th>
						<th scope="col">Fulfillment status</th>
					</tr>
				</thead>
				<tbody>
					{orders.map((order) => (
						<tr key={order.id}>
							<td className="orders-page__order-id">
								<Link className="orders-page__order-link" to={`/orders/${encodeURIComponent(order.id)}`}>
									#{order.id}
								</Link>
							</td>
							<td>
								<span className="orders-page__customer-name">{order.customerName}</span>
								<span className="orders-page__customer-email">{order.customerEmail}</span>
							</td>
							<td>{formatOrderDate(order.createdAt)}</td>
							<td>{formatOrderCurrency(order.total)}</td>
							<td>
								<OrderStatusBadge type="payment" status={order.paymentStatus} />
							</td>
							<td>
								<OrderStatusBadge type="fulfillment" status={order.fulfillmentStatus} />
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}