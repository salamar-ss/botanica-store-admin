import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import OrderDetails from '@/pages/OrderDetails';
import Orders from '@/pages/Orders';
import { renderWithProviders } from '@/test/renderWithProviders';

function renderOrderRoutes(initialRoute: string) {
	return renderWithProviders(
		<Routes>
			<Route path="/orders" element={<Orders />} />
			<Route path="/orders/:orderId" element={<OrderDetails />} />
		</Routes>,
		initialRoute,
	);
}

describe('Orders workflows', () => {
	it('filters the list and navigates to the selected order details', async () => {
		const user = userEvent.setup();
		renderOrderRoutes('/orders');
		await screen.findByRole('table', { name: /Orders with customer/ });

		await user.type(screen.getByRole('searchbox', { name: 'Search' }), 'ORD-2046');
		await user.selectOptions(screen.getByRole('combobox', { name: 'Fulfillment status' }), 'Delivered');
		const orderRow = screen.getByRole('row', { name: /ORD-2046/ });
		expect(within(orderRow).getByText('Elena Fischer')).toBeTruthy();
		expect(screen.queryByRole('row', { name: /ORD-2048/ })).toBeNull();

		await user.click(within(orderRow).getByRole('link', { name: '#ORD-2046' }));
		expect(await screen.findByRole('heading', { name: 'Order #ORD-2046' })).toBeTruthy();
		expect(screen.getByRole('region', { name: 'Customer' }).textContent).toContain('Elena Fischer');
	});

	it('updates a valid fulfillment status, gives feedback, and reflects it in the list', async () => {
		const user = userEvent.setup();
		const { queryClient } = renderOrderRoutes('/orders/ORD-2045');
		await screen.findByRole('heading', { name: 'Order #ORD-2045' });

		await user.selectOptions(screen.getByRole('combobox', { name: 'Next status' }), 'Processing');
		await user.click(screen.getByRole('button', { name: 'Update status' }));
		expect((await screen.findByRole('status')).textContent).toContain('Status updated locally to Processing.');
		expect(screen.getByText(/not saved to the server/i)).toBeTruthy();

		await user.click(screen.getByRole('link', { name: 'Back to orders' }));
		const updatedOrderRow = await screen.findByRole('row', { name: /ORD-2045/ });
		expect(within(updatedOrderRow).getByText('Processing')).toBeTruthy();
		expect(queryClient.getQueryData<unknown>(['orders', 'detail', 'ORD-2045'])).toEqual(
			expect.objectContaining({ fulfillmentStatus: 'Processing' }),
		);
	});
});