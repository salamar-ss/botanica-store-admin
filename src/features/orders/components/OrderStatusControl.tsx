import { useState } from 'react';
import { canTransitionOrderStatus, getValidOrderStatusTransitions } from '@/features/orders/orderStatus';
import { useUpdateOrderStatusMutation } from '@/features/orders/queries';
import type { FulfillmentStatus } from '@/features/orders/types';
import '@/features/orders/components/OrderStatusControl.scss';

interface OrderStatusControlProps {
	orderId: string;
	currentStatus: FulfillmentStatus;
}

export default function OrderStatusControl({ orderId, currentStatus }: OrderStatusControlProps) {
	const [nextStatus, setNextStatus] = useState<FulfillmentStatus | ''>('');
	const statusMutation = useUpdateOrderStatusMutation();
	const validTransitions = getValidOrderStatusTransitions(currentStatus);
	const canSubmit = nextStatus !== '' && canTransitionOrderStatus(currentStatus, nextStatus);

	const submitStatus = () => {
		if (nextStatus === '' || !canTransitionOrderStatus(currentStatus, nextStatus)) return;

		statusMutation.mutate({ orderId, currentStatus, status: nextStatus }, {
			onSuccess: () => setNextStatus(''),
		});
	};

	return (
		<section className="order-status-control" aria-labelledby="order-status-control-title">
			<h3 className="order-status-control__title" id="order-status-control-title">Update fulfillment status</h3>
			<p className="order-status-control__notice">
				Local demo only. Changes are held in memory and are not sent to or saved by the server.
			</p>
			<div className="order-status-control__actions">
				<label className="order-status-control__field">
					<span className="order-status-control__label">Next status</span>
					<select
						className="order-status-control__select"
						value={nextStatus}
						disabled={validTransitions.length === 0 || statusMutation.isPending}
						onChange={(event) => {
							statusMutation.reset();
							setNextStatus(event.target.value as FulfillmentStatus | '');
						}}
					>
						<option value="">Choose a valid next status</option>
						{validTransitions.map((status) => <option key={status} value={status}>{status}</option>)}
					</select>
				</label>
				<button
					className="order-status-control__submit"
					type="button"
					disabled={!canSubmit || statusMutation.isPending}
					onClick={submitStatus}
				>
					{statusMutation.isPending ? 'Updating...' : 'Update status'}
				</button>
			</div>
			{validTransitions.length === 0 && (
				<p className="order-status-control__message">No further status changes are available.</p>
			)}
			{statusMutation.isSuccess && (
				<p className="order-status-control__message" role="status">
					Status updated locally to {statusMutation.data.fulfillmentStatus}. It was not saved to the server.
				</p>
			)}
			{statusMutation.isError && (
				<p className="order-status-control__message order-status-control__message--error" role="alert">
					Status could not be updated: {statusMutation.error.message}
				</p>
			)}
		</section>
	);
}