import { describe, expect, it } from 'vitest';
import { mapApiProduct } from '@/features/products/api/productsApi';
import type { ApiProduct } from '@/features/products/api/types';
import { filterAndSortProducts } from '@/features/products/productList';
import type { Product } from '@/features/products/types';

function makeProduct(overrides: Partial<Product> & Pick<Product, 'id' | 'title'>): Product {
	return {
		category: 'beauty',
		price: 10,
		stock: 1,
		status: 'Active',
		image: 'https://example.com/product.png',
		...overrides,
	};
}

const products = [
	makeProduct({ id: '1', title: 'Aloe Cream', category: 'beauty', price: 12, stock: 0 }),
	makeProduct({ id: '2', title: 'Rose Oil', category: 'beauty', price: 24, stock: 5 }),
	makeProduct({ id: '3', title: 'Rose Soap', category: 'body-care', price: 8, stock: 2 }),
];

describe('product list rules', () => {
	it('combines case-insensitive search, category, and stock filters', () => {
		const result = filterAndSortProducts(products, {
			search: '  rOsE ',
			category: 'beauty',
			stockFilter: 'in-stock',
			sortKey: 'title',
			sortDirection: 'asc',
		});

		expect(result.map((product) => product.id)).toEqual(['2']);
	});

	it('treats zero stock as out of stock and positive stock as in stock', () => {
		const filters = {
			search: '',
			category: 'all',
			sortKey: 'title' as const,
			sortDirection: 'asc' as const,
		};

		expect(filterAndSortProducts(products, { ...filters, stockFilter: 'out-of-stock' })
			.map((product) => product.id)).toEqual(['1']);
		expect(filterAndSortProducts(products, { ...filters, stockFilter: 'in-stock' })
			.map((product) => product.id)).toEqual(['2', '3']);
	});

	it('sorts text and numeric fields in either direction without mutating input', () => {
		const originalIds = products.map((product) => product.id);
		const filters = {
			search: '',
			category: 'all',
			stockFilter: 'all' as const,
		};

		expect(filterAndSortProducts(products, {
			...filters,
			sortKey: 'price',
			sortDirection: 'asc',
		}).map((product) => product.price)).toEqual([8, 12, 24]);
		expect(filterAndSortProducts(products, {
			...filters,
			sortKey: 'stock',
			sortDirection: 'desc',
		}).map((product) => product.stock)).toEqual([5, 2, 0]);
		expect(filterAndSortProducts(products, {
			...filters,
			sortKey: 'title',
			sortDirection: 'asc',
		}).map((product) => product.title)).toEqual(['Aloe Cream', 'Rose Oil', 'Rose Soap']);
		expect(products.map((product) => product.id)).toEqual(originalIds);
	});

	it('maps API products without confusing inventory availability with publication status', () => {
		const apiProduct: ApiProduct = {
			id: 12,
			title: 'Rose Cleanser',
			category: 'skin-care',
			price: 18,
			stock: 0,
			thumbnail: 'https://example.com/rose-cleanser.png',
			availabilityStatus: 'Out of Stock',
		};

		expect(mapApiProduct(apiProduct)).toEqual({
			id: '12',
			title: 'Rose Cleanser',
			category: 'skin-care',
			price: 18,
			stock: 0,
			image: 'https://example.com/rose-cleanser.png',
			status: 'Active',
		});
	});
});