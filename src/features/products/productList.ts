import type { Product } from '@/features/products/types';

export type ProductStockFilter = 'all' | 'in-stock' | 'out-of-stock';
export type ProductSortKey = 'title' | 'price' | 'stock';
export type ProductSortDirection = 'asc' | 'desc';

export interface ProductListFilters {
	search: string;
	category: string | 'all';
	stockFilter: ProductStockFilter;
	sortKey: ProductSortKey;
	sortDirection: ProductSortDirection;
}

export function filterAndSortProducts(products: Product[], filters: ProductListFilters): Product[] {
	const normalizedSearch = filters.search.trim().toLocaleLowerCase();
	const filteredProducts = products.filter((product) => {
		const matchesTitle = product.title.toLocaleLowerCase().includes(normalizedSearch);
		const matchesCategory = filters.category === 'all' || product.category === filters.category;
		const matchesStock = filters.stockFilter === 'all'
			|| (filters.stockFilter === 'in-stock' && product.stock > 0)
			|| (filters.stockFilter === 'out-of-stock' && product.stock === 0);

		return matchesTitle && matchesCategory && matchesStock;
	});

	return filteredProducts.sort((left, right) => {
		const comparison = filters.sortKey === 'title'
			? left.title.localeCompare(right.title)
			: left[filters.sortKey] - right[filters.sortKey];

		return filters.sortDirection === 'asc' ? comparison : -comparison;
	});
}