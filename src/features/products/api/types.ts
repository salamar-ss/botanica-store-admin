import type { CategorySlug } from '@/features/categories/types';

export type ApiProductAvailability = 'In Stock' | 'Low Stock' | 'Out of Stock';

export interface ApiProduct {
	id: number;
	title: string;
	category: CategorySlug;
	price: number;
	stock: number;
	thumbnail: string;
	availabilityStatus: ApiProductAvailability;
}

export interface ApiProductListResponse {
	products: ApiProduct[];
	total: number;
	skip: number;
	limit: number;
}

export type ApiProductWritePayload = Pick<ApiProduct, 'title' | 'category' | 'price' | 'stock'> & {
	thumbnail: string;
};

export interface ApiProductMutationResponse {
	id: number;
	title?: string;
	category?: string;
	price?: number;
	stock?: number;
	thumbnail?: string;
}

export interface ApiProductDeleteResponse {
	id: number;
	isDeleted: boolean;
	deletedOn: string;
}