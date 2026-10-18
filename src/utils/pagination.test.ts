import { describe, expect, it } from 'vitest';
import { paginateItems } from '@/utils/pagination';

describe('paginateItems', () => {
	const values = ['a', 'b', 'c', 'd', 'e'];

	it('returns the requested middle page and visible range', () => {
		expect(paginateItems(values, 2, 2)).toEqual({
			items: ['c', 'd'],
			pageCount: 3,
			currentPage: 2,
			startIndex: 2,
			endIndex: 4,
		});
	});

	it('clamps an out-of-range page to the final partial page', () => {
		expect(paginateItems(values, 9, 2)).toEqual({
			items: ['e'],
			pageCount: 3,
			currentPage: 3,
			startIndex: 4,
			endIndex: 5,
		});
	});

	it('uses page one for nonpositive or noninteger page requests', () => {
		expect(paginateItems(values, 0, 2).items).toEqual(['a', 'b']);
		expect(paginateItems(values, 2.5, 2).currentPage).toBe(1);
	});

	it('returns a stable empty page and rejects invalid page sizes', () => {
		expect(paginateItems([], 1, 10)).toEqual({
			items: [],
			pageCount: 1,
			currentPage: 1,
			startIndex: 0,
			endIndex: 0,
		});
		expect(() => paginateItems(values, 1, 0)).toThrow(RangeError);
	});
});