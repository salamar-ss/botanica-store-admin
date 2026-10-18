import type { CategorySlug } from '@/features/categories/types';

export interface ApiCategory {
	slug: CategorySlug;
	name: string;
	url: string;
}

export interface ApiProductCategoryRecord {
	id: number;
	category: string;
}

export interface ApiProductCategoryListResponse {
	products: ApiProductCategoryRecord[];
	total: number;
	skip: number;
	limit: number;
}