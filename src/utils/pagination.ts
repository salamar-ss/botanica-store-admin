export interface PaginationResult<T> {
	items: T[];
	pageCount: number;
	currentPage: number;
	startIndex: number;
	endIndex: number;
}

export function paginateItems<T>(items: T[], requestedPage: number, pageSize: number): PaginationResult<T> {
	if (!Number.isSafeInteger(pageSize) || pageSize < 1) {
		throw new RangeError('Page size must be a positive integer.');
	}

	const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
	const normalizedPage = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
	const currentPage = Math.min(normalizedPage, pageCount);
	const startIndex = (currentPage - 1) * pageSize;
	const endIndex = Math.min(startIndex + pageSize, items.length);

	return {
		items: items.slice(startIndex, endIndex),
		pageCount,
		currentPage,
		startIndex,
		endIndex,
	};
}