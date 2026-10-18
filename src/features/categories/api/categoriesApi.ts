import { apiClient } from '@/api/apiClient';
import { mapApiCategory } from '@/features/categories/categoryMapping';
import type { Category } from '@/features/categories/types';
import type { ApiCategory, ApiProductCategoryListResponse } from '@/features/categories/api/types';

export async function getCategories(): Promise<Category[]> {
	const [categoryResponse, productsResponse] = await Promise.all([
		apiClient.get<ApiCategory[]>('/products/categories'),
		apiClient.get<ApiProductCategoryListResponse>('/products', {
			params: { limit: 0, select: 'id,category' },
		}),
	]);
	const productCounts = new Map<string, number>();

	for (const product of productsResponse.data.products) {
		productCounts.set(product.category, (productCounts.get(product.category) ?? 0) + 1);
	}

	return categoryResponse.data.map((category) =>
		mapApiCategory(category, productCounts.get(category.slug) ?? 0),
	);
}