import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AxiosMockAdapter from 'axios-mock-adapter';
import { apiClient } from '@/api/apiClient';
import type { ApiProduct, ApiProductListResponse } from '@/features/products/api/types';
import Products from '@/pages/Products';
import { renderWithProviders } from '@/test/renderWithProviders';

const productFixtures: ApiProduct[] = [
	{
		id: 1,
		title: 'Aloe Cream',
		category: 'beauty',
		price: 12,
		stock: 0,
		thumbnail: 'https://example.com/aloe.png',
		availabilityStatus: 'Out of Stock',
	},
	{
		id: 2,
		title: 'Rose Oil',
		category: 'beauty',
		price: 24,
		stock: 5,
		thumbnail: 'https://example.com/rose-oil.png',
		availabilityStatus: 'In Stock',
	},
	{
		id: 3,
		title: 'Rose Balm',
		category: 'beauty',
		price: 8,
		stock: 0,
		thumbnail: 'https://example.com/rose-balm.png',
		availabilityStatus: 'Out of Stock',
	},
];

function createProductResponse(products: ApiProduct[]): ApiProductListResponse {
	return { products, total: products.length, skip: 0, limit: 0 };
}

function configureCategoryRequests(adapter: AxiosMockAdapter, products = productFixtures) {
	adapter.onGet('/products/categories').reply(200, [
		{ slug: 'beauty', name: 'Beauty', url: 'https://dummyjson.com/products/category/beauty' },
		{ slug: 'skin-care', name: 'Skin Care', url: 'https://dummyjson.com/products/category/skin-care' },
	]);
	adapter.onGet('/products').reply(200, {
		products: products.map(({ id, category }) => ({ id, category })),
		total: products.length,
		skip: 0,
		limit: products.length,
	});
}

describe('Products workflows', () => {
	let adapter: AxiosMockAdapter;

	beforeEach(() => {
		adapter = new AxiosMockAdapter(apiClient, { onNoMatch: 'throwException' });
		configureCategoryRequests(adapter);
	});

	afterEach(() => adapter.restore());

	it('shows loading and then renders API products', async () => {
		let releaseProducts: (() => void) | undefined;
		adapter.onGet('/products/category/beauty').reply(() => new Promise((resolve) => {
			releaseProducts = () => resolve([200, createProductResponse(productFixtures)]);
		}));
		renderWithProviders(<Products />, '/products');

		expect(screen.getByRole('status').textContent).toContain('Loading products');
		releaseProducts?.();
		expect(await screen.findByText('Aloe Cream')).toBeTruthy();
	});

	it('shows an API error without making unrelated failures look like authentication errors', async () => {
		adapter.onGet('/products/category/beauty').reply(500, { message: 'Temporary failure' });
		renderWithProviders(<Products />, '/products');

		expect((await screen.findByRole('alert')).textContent).toContain('Products could not be loaded.');
		expect(screen.queryByText(/sign in|session expired/i)).toBeNull();
	});

	it('searches products and applies stock and category filters through accessible controls', async () => {
		adapter.onGet('/products/category/beauty').reply(200, createProductResponse(productFixtures));
		const user = userEvent.setup();
		renderWithProviders(<Products />, '/products');

		await screen.findByText('Aloe Cream');
		await user.selectOptions(screen.getByRole('combobox', { name: 'Rows per page' }), '5');
		await screen.findByText('Rose Oil');
		await user.type(screen.getByRole('searchbox', { name: 'Search by title' }), 'rose');
		await user.selectOptions(screen.getByRole('combobox', { name: 'Stock status' }), 'out-of-stock');
		expect(screen.getByText('Rose Balm')).toBeTruthy();
		expect(screen.queryByText('Rose Oil')).toBeNull();

		await user.clear(screen.getByRole('searchbox', { name: 'Search by title' }));
		await user.selectOptions(screen.getByRole('combobox', { name: 'Stock status' }), 'all');
		await user.selectOptions(screen.getByRole('combobox', { name: 'Category' }), 'skin-care');
		expect(screen.getByRole('status').textContent).toContain('No products match your search and filters.');
	});

	it('validates and submits an edited product form', async () => {
		adapter.onGet('/products/category/beauty').reply(200, createProductResponse(productFixtures));
		adapter.onPut('/products/1').reply(200, {
			id: 1,
			title: 'Aloe Cream Plus',
			category: 'beauty',
			price: 12,
			stock: 0,
			thumbnail: 'https://example.com/aloe.png',
		});
		const user = userEvent.setup();
		renderWithProviders(<Products />, '/products');
		await screen.findByText('Aloe Cream');
		await user.click(screen.getByRole('button', { name: 'Edit Aloe Cream' }));
		const dialog = await screen.findByRole('dialog', { name: 'Edit product' });
		const withinDialog = within(dialog);

		await user.clear(withinDialog.getByRole('textbox', { name: 'Product name' }));
		await user.click(withinDialog.getByRole('button', { name: 'Save changes' }));
		expect(await withinDialog.findByText('Product name is required.')).toBeTruthy();

		await user.type(withinDialog.getByRole('textbox', { name: 'Product name' }), 'Aloe Cream Plus');
		await user.click(withinDialog.getByRole('button', { name: 'Save changes' }));
		expect((await withinDialog.findByRole('status')).textContent).toContain('Changes saved for this session.');
		expect(adapter.history.put).toHaveLength(1);
	});

	it('requires delete confirmation and removes only after confirmation', async () => {
		adapter.onGet('/products/category/beauty').reply(200, createProductResponse(productFixtures));
		adapter.onDelete('/products/1').reply(200, { id: 1, isDeleted: true, deletedOn: '2026-10-17T12:00:00.000Z' });
		const confirm = vi.spyOn(window, 'confirm');
		const user = userEvent.setup();
		renderWithProviders(<Products />, '/products');
		await screen.findByText('Aloe Cream');
		const aloeRow = screen.getByRole('row', { name: /Aloe Cream/ });

		confirm.mockReturnValueOnce(false);
		await user.click(within(aloeRow).getByRole('button', { name: 'Delete Aloe Cream' }));
		expect(adapter.history.delete).toHaveLength(0);
		expect(screen.getByText('Aloe Cream')).toBeTruthy();

		confirm.mockReturnValueOnce(true);
		await user.click(within(aloeRow).getByRole('button', { name: 'Delete Aloe Cream' }));
		await waitFor(() => expect(screen.queryByRole('row', { name: /Aloe Cream/ })).toBeNull());
		expect(await screen.findByRole('row', { name: /Rose Oil/ })).toBeTruthy();
		expect(screen.queryByRole('row', { name: /Aloe Cream/ })).toBeNull();
		expect(adapter.history.delete).toHaveLength(1);
	});
});