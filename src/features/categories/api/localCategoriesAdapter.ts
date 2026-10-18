import type { Category, CategoryInput } from '@/features/categories/types';

export async function createLocalCategory(input: CategoryInput): Promise<Category> {
	return {
		id: `local:${crypto.randomUUID()}`,
		...input,
		productCount: 0,
		isLocalOnly: true,
	};
}

export async function updateLocalCategory(category: Category, updates: CategoryInput): Promise<Category> {
	return { ...category, ...updates, isLocalOnly: true };
}

export async function deleteLocalCategory(category: Category): Promise<string> {
	if (category.productCount > 0) {
		throw new Error('Categories with associated products cannot be deleted.');
	}
	return category.id;
}