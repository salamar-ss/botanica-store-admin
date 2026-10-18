import type { CategorySlug } from '@/features/categories/types';

export type ProductStatus = 'Active' | 'Draft';

export interface Product {
	id: string;
	title: string;
	category: CategorySlug;
	price: number;
	stock: number;
	status: ProductStatus;
	image: string;
	isLocalOnly?: boolean;
}

export type ProductInput = Omit<Product, 'id' | 'isLocalOnly'>;