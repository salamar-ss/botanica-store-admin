import { z } from 'zod';

export const productSchema = z.object({
	title: z.string().trim().min(1, { error: 'Product name is required.' }),
	category: z.string().trim().min(1, { error: 'Category is required.' }),
	price: z
		.string()
		.trim()
		.min(1, { error: 'Price is required.' })
		.refine((value) => value === '' || Number.isFinite(Number(value)), {
			error: 'Enter a valid price.',
		})
		.transform(Number)
		.pipe(z.number().positive({ error: 'Price must be greater than zero.' })),
	stock: z
		.string()
		.trim()
		.min(1, { error: 'Stock quantity is required.' })
		.refine((value) => value === '' || Number.isInteger(Number(value)), {
			error: 'Stock must be a whole number.',
		})
		.transform(Number)
		.pipe(z.number().int().min(0, { error: 'Stock cannot be negative.' })),
	status: z.enum(['Active', 'Draft'], { error: 'Choose a product status.' }),
	image: z
		.string()
		.trim()
		.min(1, { error: 'Image URL is required.' })
		.pipe(z.string().url({ error: 'Enter a valid image URL.' }))
		.refine((image) => /^https?:\/\//i.test(image), {
			error: 'Image URL must start with http:// or https://.',
		}),
});

export type ProductFormValues = z.infer<typeof productSchema>;
export type ProductFormInput = z.input<typeof productSchema>;