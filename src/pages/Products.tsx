import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProductCategoryLabel, getProductCategoryOptions } from '@/features/categories/categoryMapping';
import { useCategoriesQuery } from '@/features/categories/queries';
import ProductActions from '@/features/products/components/ProductActions';
import ProductDetailsDialog from '@/features/products/components/ProductDetailsDialog';
import ProductFormDialog from '@/features/products/components/ProductFormDialog';
import {
	useCreateProductMutation,
	useDeleteProductMutation,
	useProductsQuery,
	useUpdateProductMutation,
} from '@/features/products/queries';
import {
	filterAndSortProducts,
	type ProductSortDirection,
	type ProductSortKey,
	type ProductStockFilter,
} from '@/features/products/productList';
import type { ProductFormValues } from '@/features/products/schema';
import type { Product } from '@/features/products/types';
import { paginateItems } from '@/utils/pagination';
import '@/pages/Products.scss';

type PageSize = 2 | 5 | 10;
type ProductViewParam = 'q' | 'category' | 'stock' | 'sort' | 'direction' | 'pageSize' | 'page';
type ProductViewUpdates = Partial<Record<ProductViewParam, string | number | null>>;
type SearchParamsSetter = ReturnType<typeof useSearchParams>[1];

const pageSizes: PageSize[] = [2, 5, 10];

const currencyFormatter = new Intl.NumberFormat('en-IE', {
	style: 'currency',
	currency: 'EUR',
});

function updateProductView(
	setSearchParams: SearchParamsSetter,
	updates: ProductViewUpdates,
	replace = false,
) {
	setSearchParams((currentParams) => {
		const nextParams = new URLSearchParams(currentParams);

		for (const [key, value] of Object.entries(updates)) {
			if (value === null || value === undefined || value === '') {
				nextParams.delete(key);
			} else {
				nextParams.set(key, String(value));
			}
		}

		return nextParams;
	}, { replace });
}

interface ProductRowProps {
	product: Product;
	categoryLabel: string;
	onView: () => void;
	onEdit: () => void;
	onDelete: (productId: string) => void;
	deletePending: boolean;
	isDeletingProduct: boolean;
}

function ProductRow({
	product,
	categoryLabel,
	onView,
	onEdit,
	onDelete,
	deletePending,
	isDeletingProduct,
}: ProductRowProps) {
	const statusClass = product.status.toLowerCase();

	return (
		<tr>
			<td>
				<div className="products-page__product">
					<img className="products-page__image" src={product.image} alt="" loading="lazy" />
					<span className="products-page__product-name">{product.title}</span>
				</div>
			</td>
			<td>{categoryLabel}</td>
			<td>{currencyFormatter.format(product.price)}</td>
			<td>{product.stock}</td>
			<td>
				<span className={`products-page__status products-page__status--${statusClass}`}>
					{product.status}
				</span>
			</td>
			<td>
				<ProductActions
					product={product}
					onView={onView}
					onEdit={onEdit}
					onDelete={onDelete}
					deletePending={deletePending}
					isDeletingProduct={isDeletingProduct}
				/>
			</td>
		</tr>
	);
}

export default function Products() {
	const [searchParams, setSearchParams] = useSearchParams();
	const productsQuery = useProductsQuery();
	const categoriesQuery = useCategoriesQuery();
	const createProductMutation = useCreateProductMutation();
	const updateProductMutation = useUpdateProductMutation();
	const deleteProductMutation = useDeleteProductMutation();
	const productList = productsQuery.data ?? [];
	const search = searchParams.get('q') ?? '';
	const category = searchParams.get('category') || 'all';
	const requestedStock = searchParams.get('stock');
	const stockFilter: ProductStockFilter = requestedStock === 'in-stock' || requestedStock === 'out-of-stock'
		? requestedStock
		: 'all';
	const requestedSort = searchParams.get('sort');
	const sortKey: ProductSortKey = requestedSort === 'price' || requestedSort === 'stock'
		? requestedSort
		: 'title';
	const sortDirection: ProductSortDirection = searchParams.get('direction') === 'desc' ? 'desc' : 'asc';
	const requestedPageSize = Number(searchParams.get('pageSize'));
	const pageSize: PageSize = pageSizes.includes(requestedPageSize as PageSize)
		? requestedPageSize as PageSize
		: 2;
	const requestedPage = Number(searchParams.get('page'));
	const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
	const [deleteNotice, setDeleteNotice] = useState<string | null>(null);
	const [activeDialog, setActiveDialog] = useState<
		| { mode: 'details'; productId: string }
		| { mode: 'form'; productId?: string }
		| null
	>(null);

	const categoryOptions = getProductCategoryOptions(categoriesQuery.data ?? [], productList);
	const filterCategoryOptions = category !== 'all' && !categoryOptions.some((option) => option.slug === category)
		? [...categoryOptions, { slug: category, label: `Unavailable category (${category})`, isAvailable: false }]
		: categoryOptions;
	const activeProductId = activeDialog?.mode === 'details' || activeDialog?.mode === 'form'
		? activeDialog.productId
		: undefined;
	const activeProduct = productList.find((product) => product.id === activeProductId);

	const deleteProduct = (productId: string) => {
		setDeleteNotice(null);
		deleteProductMutation.mutate(productId, {
			onSuccess: () => {
				const remainingProducts = productList.filter((product) => product.id !== productId);
				const wasLocalOnly = productList.find((product) => product.id === productId)?.isLocalOnly;
				setDeleteNotice(wasLocalOnly
					? 'Product removed from this session.'
					: 'Product removed from this session. DummyJSON simulates deletes; refreshing restores server data.');

				const categoryWasRemoved = category !== 'all' &&
					!remainingProducts.some((product) => product.category === category);
				updateProductView(setSearchParams, {
					...(categoryWasRemoved ? { category: null } : {}),
					page: null,
				}, true);
			},
		});
	};

	const saveProduct = async (values: ProductFormValues) => {
		if (activeDialog?.mode === 'form' && activeDialog.productId && activeProduct) {
			await updateProductMutation.mutateAsync({ product: activeProduct, updates: values });
			updateProductView(setSearchParams, { page: null }, true);
		} else {
			await createProductMutation.mutateAsync(values);
			updateProductView(setSearchParams, {
				q: null,
				category: null,
				stock: null,
				page: null,
			});
		}
	};

	const sortedProducts = filterAndSortProducts(productList, {
		search,
		category,
		stockFilter,
		sortKey,
		sortDirection,
	});

	const productPage = paginateItems(sortedProducts, page, pageSize);
	const { pageCount, currentPage, startIndex: firstItemIndex, endIndex, items: pageProducts } = productPage;

	useEffect(() => {
		const lastPage = Math.max(pageCount, 1);
		if (productsQuery.data !== undefined && page > lastPage) {
			updateProductView(setSearchParams, { page: lastPage === 1 ? null : lastPage }, true);
		}
	}, [page, pageCount, productsQuery.data, setSearchParams]);

	const failedDeleteProduct = productList.find((product) => product.id === deleteProductMutation.variables);
	return (
		<section className="products-page" aria-label="Product inventory">
			<div className="products-page__toolbar">
				<p className="products-page__count" aria-live="polite" aria-atomic="true">
					{productsQuery.isPending
						? 'Loading products...'
						: productsQuery.isError && productsQuery.data === undefined
							? 'Products unavailable'
							: `Showing ${sortedProducts.length === 0 ? 0 : firstItemIndex + 1}–${endIndex} of ${sortedProducts.length} products`}
				</p>
				<button
					className="products-page__add-button"
					type="button"
					disabled={productsQuery.data === undefined || !categoryOptions.some((option) => option.isAvailable)}
					onClick={() => setActiveDialog({ mode: 'form' })}
				>
					<svg viewBox="0 0 20 20" aria-hidden="true">
						<path d="M10 4v12M4 10h12" />
					</svg>
					<span>Add Product</span>
				</button>
			</div>

			{productsQuery.isPending ? (
				<p className="products-page__request-state" role="status">Loading products...</p>
			) : productsQuery.isError && productsQuery.data === undefined ? (
				<div className="products-page__request-state products-page__request-state--error" role="alert">
					<p>Products could not be loaded. Check your connection and try again.</p>
					<button
						className="products-page__dialog-close"
						type="button"
						onClick={() => void productsQuery.refetch()}
					>
						Try again
					</button>
				</div>
			) : (
				<>
					{deleteNotice && (
						<p className="products-page__request-warning" role="status">{deleteNotice}</p>
					)}
					{productsQuery.isError && (
						<p className="products-page__request-warning" role="status">
							Could not refresh products; showing the cached list.
						</p>
					)}
					{categoriesQuery.isError && (
						<p className="products-page__request-warning" role="status">
							Category data is unavailable. Product category slugs are shown as unavailable until it can be loaded.
						</p>
					)}
			<div
				className="products-page__controls"
				role="group"
				aria-label="Search, filter, and sort products"
			>
				<div className="products-page__field products-page__field--search">
					<label className="products-page__label" htmlFor="product-search">Search by title</label>
					<input
						className="products-page__input"
						id="product-search"
						type="search"
						value={search}
						placeholder="Search products"
						onChange={(event) => updateProductView(
							setSearchParams,
							{ q: event.target.value, page: null },
							true,
						)}
					/>
				</div>
				<div className="products-page__field">
					<label className="products-page__label" htmlFor="product-category">Category</label>
					<select
						className="products-page__select"
						id="product-category"
						value={category}
						onChange={(event) => updateProductView(setSearchParams, {
							category: event.target.value === 'all' ? null : event.target.value,
							page: null,
						})}
					>
						<option value="all">All categories</option>
						{filterCategoryOptions.map((productCategory) => (
							<option key={productCategory.slug} value={productCategory.slug}>{productCategory.label}</option>
						))}
					</select>
				</div>
				<div className="products-page__field">
					<label className="products-page__label" htmlFor="product-stock">Stock status</label>
					<select
						className="products-page__select"
						id="product-stock"
						value={stockFilter}
						onChange={(event) => updateProductView(setSearchParams, {
							stock: event.target.value === 'all' ? null : event.target.value,
							page: null,
						})}
					>
						<option value="all">All stock</option>
						<option value="in-stock">In stock</option>
						<option value="out-of-stock">Out of stock</option>
					</select>
				</div>
				<div className="products-page__field">
					<label className="products-page__label" htmlFor="product-sort">Sort by</label>
					<select
						className="products-page__select"
						id="product-sort"
						value={sortKey}
						onChange={(event) => updateProductView(setSearchParams, {
							sort: event.target.value === 'title' ? null : event.target.value,
							page: null,
						})}
					>
						<option value="title">Title</option>
						<option value="price">Price</option>
						<option value="stock">Stock</option>
					</select>
				</div>
				<div className="products-page__field">
					<label className="products-page__label" htmlFor="product-sort-direction">Direction</label>
					<select
						className="products-page__select"
						id="product-sort-direction"
						value={sortDirection}
						onChange={(event) => updateProductView(setSearchParams, {
							direction: event.target.value === 'asc' ? null : event.target.value,
							page: null,
						})}
					>
						<option value="asc">Ascending</option>
						<option value="desc">Descending</option>
					</select>
				</div>
			</div>

			{productList.length === 0 ? (
				<p className="products-page__empty-state" role="status">No products are available.</p>
			) : pageProducts.length > 0 ? (
				<div className="products-page__table-wrap">
					<table className="products-page__table">
						<caption className="products-page__caption">Products available in the Botanica catalogue</caption>
						<thead>
							<tr>
								<th scope="col">Product</th>
								<th scope="col">Category</th>
								<th scope="col">Price</th>
								<th scope="col">Stock</th>
								<th scope="col">Status</th>
								<th scope="col">Actions</th>
							</tr>
						</thead>
						<tbody>
							{pageProducts.map((product) => (
								<ProductRow
									key={product.id}
									product={product}
									categoryLabel={getProductCategoryLabel(product.category, categoryOptions)}
									onView={() => setActiveDialog({ mode: 'details', productId: product.id })}
									onEdit={() => setActiveDialog({ mode: 'form', productId: product.id })}
									onDelete={deleteProduct}
									deletePending={deleteProductMutation.isPending}
									isDeletingProduct={deleteProductMutation.variables === product.id}
								/>
							))}
						</tbody>
					</table>
				</div>
			) : (
				<p className="products-page__empty-state" role="status">
					No products match your search and filters.
				</p>
			)}

			{sortedProducts.length > 0 && (
				<div className="products-page__pagination">
					<div className="products-page__page-size">
						<label className="products-page__label" htmlFor="product-page-size">Rows per page</label>
						<select
							className="products-page__select products-page__select--page-size"
							id="product-page-size"
							value={pageSize}
							onChange={(event) => updateProductView(setSearchParams, {
								pageSize: Number(event.target.value) === 2 ? null : event.target.value,
								page: null,
							})}
						>
							{pageSizes.map((size) => <option key={size} value={size}>{size}</option>)}
						</select>
					</div>
					<div
						className="products-page__page-controls"
						role="group"
						aria-label="Product pagination"
					>
						<button
							className="products-page__page-button"
							type="button"
							aria-label="Previous page"
							disabled={currentPage <= 1}
							onClick={() => updateProductView(setSearchParams, {
								page: currentPage <= 2 ? null : currentPage - 1,
							})}
						>
							<span aria-hidden="true">‹</span>
						</button>
						<span className="products-page__page-indicator" aria-live="polite">
							Page {currentPage} of {pageCount}
						</span>
						<button
							className="products-page__page-button"
							type="button"
							aria-label="Next page"
							disabled={currentPage >= pageCount}
							onClick={() => updateProductView(setSearchParams, { page: currentPage + 1 })}
						>
							<span aria-hidden="true">›</span>
						</button>
					</div>
				</div>
			)}
				{deleteProductMutation.isError && (
					<p className="products-page__request-warning" role="alert">
						{failedDeleteProduct?.title ?? 'Product'} could not be deleted and remains in the list.
						<button type="button" onClick={() => deleteProductMutation.reset()}>Dismiss</button>
					</p>
				)}
				</>
			)}

			{activeProduct && activeDialog?.mode === 'details' && (
				<ProductDetailsDialog
					product={activeProduct}
					categoryLabel={getProductCategoryLabel(activeProduct.category, categoryOptions)}
					onClose={() => setActiveDialog(null)}
				/>
			)}
			{activeDialog?.mode === 'form' && (
				activeProduct ? (
					<ProductFormDialog
						key={activeProduct.id}
						mode="edit"
						product={activeProduct}
						categories={categoryOptions}
						onClose={() => setActiveDialog(null)}
						onSave={saveProduct}
					/>
				) : (
					<ProductFormDialog
						key="new-product"
						mode="create"
						categories={categoryOptions}
						onClose={() => setActiveDialog(null)}
						onSave={saveProduct}
					/>
				)
			)}
		</section>
	);
}