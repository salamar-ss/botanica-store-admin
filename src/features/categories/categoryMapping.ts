import type { ApiCategory } from '@/features/categories/api/types';
import type { Category, CategorySlug } from '@/features/categories/types';
import type { Product } from '@/features/products/types';

export interface ProductCategoryOption {
	slug: CategorySlug;
	label: string;
	isAvailable: boolean;
}

export function mapApiCategory(apiCategory: ApiCategory, productCount: number): Category {
	return {
		id: apiCategory.slug,
		name: apiCategory.name,
		slug: apiCategory.slug,
		productCount,
		isLocalOnly: false,
	};
}

export function getProductCategoryOptions(
	categories: Category[],
	products: Pick<Product, 'category'>[],
): ProductCategoryOption[] {
	const categoriesBySlug = new Map(categories.map((category) => [category.slug, category]));
	const slugs = new Set([
		...categories.map((category) => category.slug),
		...products.map((product) => product.category),
	]);

	return [...slugs]
		.map((slug) => {
			const category = categoriesBySlug.get(slug);
			return {
				slug,
				label: category?.name ?? `Unavailable category (${slug})`,
				isAvailable: category !== undefined,
			};
		})
		.sort((left, right) => left.label.localeCompare(right.label));
}

export function getProductCategoryLabel(slug: CategorySlug, options: ProductCategoryOption[]): string {
	return options.find((option) => option.slug === slug)?.label ?? `Unavailable category (${slug})`;
}