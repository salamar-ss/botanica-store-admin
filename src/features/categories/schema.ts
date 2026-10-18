import { z } from 'zod';
import type { Category } from '@/features/categories/types';

const categoryFieldsSchema = z.object({
	name: z.string().trim().min(1, { error: 'Category name is required.' })
		.max(60, { error: 'Category name must be 60 characters or fewer.' }),
	slug: z.string().trim().min(1, { error: 'Slug is required.' })
		.max(80, { error: 'Slug must be 80 characters or fewer.' })
		.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
			error: 'Use lowercase letters and numbers separated by single hyphens.',
		}),
});

export function createCategorySchema(categories: Category[], currentCategoryId?: string) {
	return categoryFieldsSchema.superRefine((values, context) => {
		const duplicateName = categories.some((category) =>
			category.id !== currentCategoryId && category.name.toLocaleLowerCase() === values.name.toLocaleLowerCase(),
		);
		const duplicateSlug = categories.some((category) =>
			category.id !== currentCategoryId && category.slug === values.slug,
		);

		if (duplicateName) {
			context.addIssue({ code: 'custom', path: ['name'], message: 'A category with this name already exists.' });
		}
		if (duplicateSlug) {
			context.addIssue({ code: 'custom', path: ['slug'], message: 'A category with this slug already exists.' });
		}
	});
}

export type CategoryFormInput = z.input<typeof categoryFieldsSchema>;
export type CategoryFormValues = z.output<typeof categoryFieldsSchema>;