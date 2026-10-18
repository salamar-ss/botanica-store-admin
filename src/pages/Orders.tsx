import { useState } from 'react';
import OrdersTable from '@/features/orders/components/OrdersTable';
import { filterAndSortOrders, type OrderSortDirection, type OrderSortKey, type OrderStatusFilter } from '@/features/orders/orderList';
import { useOrdersQuery } from '@/features/orders/queries';
import type { OrderStatus } from '@/features/orders/types';
import { paginateItems } from '@/utils/pagination';
import '@/pages/Orders.scss';

const orderStatuses: OrderStatus[] = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
const pageSizes = [5, 10, 20] as const;

export default function Orders() {
	const ordersQuery = useOrdersQuery();
	const orders = ordersQuery.data ?? [];
	const [search, setSearch] = useState('');
	const [fulfillmentStatus, setFulfillmentStatus] = useState<OrderStatusFilter>('all');
	const [dateFrom, setDateFrom] = useState('');
	const [dateTo, setDateTo] = useState('');
	const [sortKey, setSortKey] = useState<OrderSortKey>('date');
	const [sortDirection, setSortDirection] = useState<OrderSortDirection>('desc');
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState<(typeof pageSizes)[number]>(5);
	const filteredOrders = filterAndSortOrders(orders, {
		search,
		fulfillmentStatus,
		dateFrom,
		dateTo,
	}, { key: sortKey, direction: sortDirection });
	const orderPage = paginateItems(filteredOrders, page, pageSize);
	const { pageCount, currentPage, startIndex: firstOrderIndex, endIndex, items: pageOrders } = orderPage;
	const hasActiveFilters = Boolean(search || fulfillmentStatus !== 'all' || dateFrom || dateTo);

	const changeSort = (key: OrderSortKey) => {
		setSortDirection(sortKey === key && sortDirection === 'desc' ? 'asc' : 'desc');
		setSortKey(key);
		setPage(1);
	};

	const clearFilters = () => {
		setSearch('');
		setFulfillmentStatus('all');
		setDateFrom('');
		setDateTo('');
		setPage(1);
	};

	return (
		<main className="orders-page">
			<div className="orders-page__heading">
				<div>
					<h2 className="orders-page__title">Orders</h2>
					<p className="orders-page__subtitle">Search, filter, and review recent customer purchases.</p>
				</div>
				<p className="orders-page__count" aria-live="polite" aria-atomic="true">
					{ordersQuery.isPending
						? 'Loading orders...'
						: `Showing ${filteredOrders.length === 0 ? 0 : firstOrderIndex + 1}-${endIndex} of ${filteredOrders.length} orders`}
				</p>
			</div>

			<p className="orders-page__notice">
				Showing sample orders because the API has no orders endpoint, and its cart data omits order dates and statuses.
			</p>

			<section className="orders-page__filters" aria-label="Search and filter orders">
				<label className="orders-page__field orders-page__field--search">
					<span className="orders-page__label">Search</span>
					<input
						className="orders-page__input"
						type="search"
						value={search}
						placeholder="Order number or customer"
						onChange={(event) => { setSearch(event.target.value); setPage(1); }}
					/>
				</label>
				<label className="orders-page__field">
					<span className="orders-page__label">Fulfillment status</span>
					<select
						className="orders-page__select"
						value={fulfillmentStatus}
						onChange={(event) => { setFulfillmentStatus(event.target.value as OrderStatusFilter); setPage(1); }}
					>
						<option value="all">All statuses</option>
						{orderStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
					</select>
				</label>
				<label className="orders-page__field">
					<span className="orders-page__label">From date</span>
					<input
						className="orders-page__input"
						type="date"
						value={dateFrom}
						onChange={(event) => { setDateFrom(event.target.value); setPage(1); }}
					/>
				</label>
				<label className="orders-page__field">
					<span className="orders-page__label">To date</span>
					<input
						className="orders-page__input"
						type="date"
						value={dateTo}
						onChange={(event) => { setDateTo(event.target.value); setPage(1); }}
					/>
				</label>
				<button className="orders-page__clear-button" type="button" onClick={clearFilters} disabled={!hasActiveFilters}>
					Clear filters
				</button>
			</section>

			{ordersQuery.isPending ? (
				<p className="orders-page__request-state" role="status">Loading orders...</p>
			) : ordersQuery.isError ? (
				<div className="orders-page__request-state orders-page__request-state--error" role="alert">
					<p>Orders could not be loaded. {ordersQuery.error.message}</p>
					<button
						className="orders-page__retry-button"
						type="button"
						onClick={() => void ordersQuery.refetch()}
						disabled={ordersQuery.isFetching}
					>
						{ordersQuery.isFetching ? 'Retrying...' : 'Retry'}
					</button>
				</div>
			) : orders.length === 0 ? (
				<p className="orders-page__empty-state">No orders to display yet.</p>
			) : filteredOrders.length === 0 ? (
				<div className="orders-page__empty-state">
					<p>No orders match your search or filters.</p>
					<button className="orders-page__clear-button" type="button" onClick={clearFilters}>Clear filters</button>
				</div>
			) : (
				<>
					<OrdersTable
						orders={pageOrders}
						sortKey={sortKey}
						sortDirection={sortDirection}
						onSort={changeSort}
					/>
					<div className="orders-page__pagination">
						<label className="orders-page__page-size">
							<span>Rows per page</span>
							<select
								className="orders-page__select orders-page__select--page-size"
								value={pageSize}
								onChange={(event) => { setPageSize(Number(event.target.value) as (typeof pageSizes)[number]); setPage(1); }}
							>
								{pageSizes.map((size) => <option key={size} value={size}>{size}</option>)}
							</select>
						</label>
						<nav className="orders-page__page-controls" aria-label="Order pages">
							<span className="orders-page__page-indicator" aria-live="polite">Page {currentPage} of {pageCount}</span>
							<button
								className="orders-page__page-button"
								type="button"
								aria-label="Previous orders page"
								disabled={currentPage <= 1}
								onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
							>
								Previous
							</button>
							<button
								className="orders-page__page-button"
								type="button"
								aria-label="Next orders page"
								disabled={currentPage >= pageCount}
								onClick={() => setPage((currentPage) => Math.min(pageCount, currentPage + 1))}
							>
								Next
							</button>
						</nav>
					</div>
				</>
			)}
		</main>
	);
}