import { describe, expect, it } from 'vitest';
import { getProductCategoryOptions, mapApiCategory } from '@/features/categories/categoryMapping';
import type { Category } from '@/features/categories/types';

describe('category mapping', () => {
	it('maps the API category shape to the shared category model', () => {
		expect(mapApiCategory({
			slug: 'skin-care',
			name: 'Skin Care',
			url: 'https://dummyjson.com/products/category/skin-care',
		}, 4)).toEqual({
			id: 'skin-care',
			name: 'Skin Care',
			slug: 'skin-care',
			productCount: 4,
			isLocalOnly: false,
		});
	});

	it('uses the latest category name while preserving the product slug', () => {
		const categories: Category[] = [{
			id: 'beauty',
			name: 'Botanical Care',
			slug: 'beauty',
			productCount: 2,
			isLocalOnly: true,
		}];
		const options = getProductCategoryOptions(categories, [{ category: 'beauty' }]);

		expect(options).toEqual([{ slug: 'beauty', label: 'Botanical Care', isAvailable: true }]);
	});

	it('retains product-referenced slugs when category metadata is deleted or unavailable', () => {
		const options = getProductCategoryOptions([], [
			{ category: 'legacy-care' },
			{ category: 'legacy-care' },
		]);

		expect(options).toEqual([{
			slug: 'legacy-care',
			label: 'Unavailable category (legacy-care)',
			isAvailable: false,
		}]);
	});
});