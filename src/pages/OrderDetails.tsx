import { Link, useParams } from 'react-router-dom';
import OrderStatusControl from '@/features/orders/components/OrderStatusControl';
import OrderStatusBadge from '@/features/orders/components/OrderStatusBadge';
import { formatOrderCurrency, formatOrderDateTime } from '@/features/orders/formatters';
import { useOrderQuery } from '@/features/orders/queries';
import '@/pages/OrderDetails.scss';

export default function OrderDetails() {
	const { orderId } = useParams();
	const orderQuery = useOrderQuery(orderId ?? '');
	const order = orderQuery.data;

	return (
		<main className="order-details-page" aria-label="Order details">
			<Link className="order-details-page__back-link" to="/orders">Back to orders</Link>

			{orderQuery.isPending && orderId ? (
				<p className="order-details-page__state" role="status">Loading order...</p>
			) : orderQuery.isError ? (
				<div className="order-details-page__state order-details-page__state--error" role="alert">
					<p>Order details could not be loaded. {orderQuery.error.message}</p>
					<button
						className="order-details-page__retry-button"
						type="button"
						onClick={() => void orderQuery.refetch()}
						disabled={orderQuery.isFetching}
					>
						{orderQuery.isFetching ? 'Retrying...' : 'Retry'}
					</button>
				</div>
			) : !order ? (
				<section className="order-details-page__state" aria-labelledby="order-details-title">
					<h2 className="order-details-page__title" id="order-details-title">Order not found</h2>
					<p>No order with ID {orderId ? `#${orderId}` : 'provided'} is available.</p>
				</section>
			) : (
				<>
					<header className="order-details-page__heading">
						<div>
							<h2 className="order-details-page__title" id="order-details-title">Order #{order.id}</h2>
							<p className="order-details-page__date">Placed {formatOrderDateTime(order.createdAt)}</p>
						</div>
						<OrderStatusBadge type="fulfillment" status={order.fulfillmentStatus} />
					</header>

					<div className="order-details-page__overview">
						<section className="order-details-page__section" aria-labelledby="order-customer-title">
							<h3 className="order-details-page__section-title" id="order-customer-title">Customer</h3>
							<p className="order-details-page__customer-name">{order.customerName}</p>
							<p className="order-details-page__customer-email">{order.customerEmail}</p>
						</section>
						<section className="order-details-page__section" aria-labelledby="order-status-title">
							<h3 className="order-details-page__section-title" id="order-status-title">Order information</h3>
							<dl className="order-details-page__status-list">
								<div>
									<dt>Payment status</dt>
									<dd><OrderStatusBadge type="payment" status={order.paymentStatus} /></dd>
								</div>
								<div>
									<dt>Fulfillment status</dt>
									<dd><OrderStatusBadge type="fulfillment" status={order.fulfillmentStatus} /></dd>
								</div>
							</dl>
						</section>
					</div>
					<OrderStatusControl orderId={order.id} currentStatus={order.fulfillmentStatus} />

					<section className="order-details-page__section" aria-labelledby="order-items-title">
						<h3 className="order-details-page__section-title" id="order-items-title">Items</h3>
						{order.items.length === 0 ? (
							<p className="order-details-page__empty-items">No line items are available for this order.</p>
						) : (
							<div className="order-details-page__table-wrap">
								<table className="order-details-page__table">
									<caption className="order-details-page__caption">Items in order #{order.id}</caption>
									<thead>
										<tr>
											<th scope="col">Item</th>
											<th scope="col">Quantity</th>
											<th scope="col">Unit price</th>
											<th scope="col">Line total</th>
										</tr>
									</thead>
									<tbody>
										{order.items.map((item) => (
											<tr key={item.productId}>
												<th scope="row">{item.title}</th>
												<td>{item.quantity}</td>
												<td>{formatOrderCurrency(item.unitPrice)}</td>
												<td>{formatOrderCurrency(item.unitPrice * item.quantity)}</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}
						<dl className="order-details-page__totals">
							<div>
								<dt>Items subtotal</dt>
								<dd>{formatOrderCurrency(order.items.reduce((subtotal, item) => subtotal + item.unitPrice * item.quantity, 0))}</dd>
							</div>
							<div className="order-details-page__grand-total">
								<dt>Order total</dt>
								<dd>{formatOrderCurrency(order.total)}</dd>
							</div>
						</dl>
					</section>
				</>
			)}
		</main>
	);
}