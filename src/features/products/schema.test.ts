import { describe, expect, it } from 'vitest';
import { productSchema, type ProductFormInput } from '@/features/products/schema';

function validInput(overrides: Partial<ProductFormInput> = {}): ProductFormInput {
	return {
		title: 'Rose Cleanser',
		category: 'skin-care',
		price: '12.50',
		stock: '4',
		status: 'Active',
		image: 'https://example.com/rose-cleanser.png',
		...overrides,
	};
}

describe('product schema', () => {
	it('trims text and converts valid numeric fields', () => {
		expect(productSchema.parse(validInput({ title: ' Rose Cleanser ', category: ' skin-care ' }))).toEqual({
			title: 'Rose Cleanser',
			category: 'skin-care',
			price: 12.5,
			stock: 4,
			status: 'Active',
			image: 'https://example.com/rose-cleanser.png',
		});
	});

	it('accepts the minimum positive price and zero stock', () => {
		expect(productSchema.parse(validInput({ price: '0.01', stock: '0' }))).toMatchObject({
			price: 0.01,
			stock: 0,
		});
	});

	it.each([
		['blank product title', { title: ' ' }],
		['blank category', { category: '' }],
		['missing price', { price: '' }],
		['nonnumeric price', { price: 'not-a-price' }],
		['zero price', { price: '0' }],
		['negative price', { price: '-1' }],
		['fractional stock', { stock: '1.5' }],
		['negative stock', { stock: '-1' }],
		['invalid image URL', { image: 'not-a-url' }],
		['unsupported image protocol', { image: 'ftp://example.com/product.png' }],
	] as const)('rejects %s', (_label, overrides) => {
		expect(productSchema.safeParse(validInput(overrides)).success).toBe(false);
	});
});