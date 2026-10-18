import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getMockOrder, getMockOrders, updateMockOrderStatus } from '@/features/orders/api/mockOrdersAdapter';
import type { Order, UpdateOrderStatusInput } from '@/features/orders/types';

export const orderQueryKeys = {
	all: ['orders'] as const,
	list: () => [...orderQueryKeys.all, 'list'] as const,
	detail: (orderId: string) => [...orderQueryKeys.all, 'detail', orderId] as const,
};

export function useOrdersQuery() {
	return useQuery({
		queryKey: orderQueryKeys.list(),
		queryFn: getMockOrders,
		retry: false,
	});
}

export function useOrderQuery(orderId: string) {
	return useQuery({
		queryKey: orderQueryKeys.detail(orderId),
		queryFn: () => getMockOrder(orderId),
		enabled: Boolean(orderId),
		retry: false,
	});
}

export function useUpdateOrderStatusMutation() {
	const queryClient = useQueryClient();

	return useMutation<Order, Error, UpdateOrderStatusInput>({
		mutationFn: updateMockOrderStatus,
		onSuccess: async (updatedOrder) => {
			const cachedOrders = queryClient.getQueryData<Order[]>(orderQueryKeys.list());
			const orders = await getMockOrders();
			queryClient.setQueryData<Order[]>(
				orderQueryKeys.list(),
				orders.map((order) => {
					if (order.id === updatedOrder.id) return updatedOrder;
					return cachedOrders?.find((cachedOrder) => cachedOrder.id === order.id) ?? order;
				}),
			);
			queryClient.setQueryData<Order | null>(orderQueryKeys.detail(updatedOrder.id), updatedOrder);
		},
	});
}