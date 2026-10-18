import { useState } from 'react';
import CategoryActions from '@/features/categories/components/CategoryActions';
import CategoryFormDialog from '@/features/categories/components/CategoryFormDialog';
import {
	useCategoriesQuery,
	useCreateCategoryMutation,
	useDeleteCategoryMutation,
	useUpdateCategoryMutation,
} from '@/features/categories/queries';
import type { Category, CategoryInput } from '@/features/categories/types';
import { useProductsQuery } from '@/features/products/queries';
import '@/pages/Categories.scss';

type CategorySortKey = 'name' | 'productCount';
type SortDirection = 'asc' | 'desc';

export default function Categories() {
	const categoriesQuery = useCategoriesQuery();
	const productsQuery = useProductsQuery();
	const createCategoryMutation = useCreateCategoryMutation();
	const updateCategoryMutation = useUpdateCategoryMutation();
	const deleteCategoryMutation = useDeleteCategoryMutation();
	const [search, setSearch] = useState('');
	const [sortKey, setSortKey] = useState<CategorySortKey>('name');
	const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
	const [activeDialog, setActiveDialog] = useState<{ mode: 'create' } | { mode: 'edit'; categoryId: string } | null>(null);
	const categories = categoriesQuery.data ?? [];
	const localProductCounts = new Map<string, number>();

	for (const product of productsQuery.data ?? []) {
		if (product.isLocalOnly) {
			localProductCounts.set(product.category, (localProductCounts.get(product.category) ?? 0) + 1);
		}
	}

	const categoriesWithCounts = categories.map((category) => ({
		...category,
		productCount: category.productCount + (localProductCounts.get(category.slug) ?? 0),
	}));
	const activeCategory = activeDialog?.mode === 'edit'
		? categoriesWithCounts.find((category) => category.id === activeDialog.categoryId)
		: undefined;
	const normalizedSearch = search.trim().toLocaleLowerCase();
	const filteredCategories = categoriesWithCounts.filter((category) =>
		category.name.toLocaleLowerCase().includes(normalizedSearch)
		|| category.slug.toLocaleLowerCase().includes(normalizedSearch),
	);
	const sortedCategories = [...filteredCategories].sort((left, right) => {
		const comparison = sortKey === 'name'
			? left.name.localeCompare(right.name)
			: left.productCount - right.productCount;
		return sortDirection === 'asc' ? comparison : -comparison;
	});
	const isMutating = createCategoryMutation.isPending || updateCategoryMutation.isPending;
	const canCheckProductAssociations = productsQuery.data !== undefined && !productsQuery.isError;

	const changeSort = (key: CategorySortKey) => {
		if (sortKey === key) {
			setSortDirection((direction) => direction === 'asc' ? 'desc' : 'asc');
		} else {
			setSortKey(key);
			setSortDirection('asc');
		}
	};

	const saveCategory = async (values: CategoryInput) => {
		if (activeDialog?.mode === 'edit' && activeCategory) {
			await updateCategoryMutation.mutateAsync({ category: activeCategory, updates: values });
		} else {
			await createCategoryMutation.mutateAsync(values);
		}
	};

	const deleteCategory = (category: Category) => {
		deleteCategoryMutation.mutate({ ...category, productCount: category.productCount });
	};

	const getSortLabel = (key: CategorySortKey) => {
		if (sortKey !== key) return 'none';
		return sortDirection === 'asc' ? 'ascending' : 'descending';
	};

	return (
		<main className="categories-page" aria-label="Category management">
			<div className="categories-page__heading">
				<div>
					<h2 className="categories-page__title">Categories</h2>
					<p className="categories-page__subtitle">Organize products by category.</p>
				</div>
				<button
					className="categories-page__add-button"
					type="button"
					disabled={categoriesQuery.data === undefined || isMutating}
					onClick={() => setActiveDialog({ mode: 'create' })}
				>
					<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 4v12M4 10h12" /></svg>
					<span>Add category</span>
				</button>
			</div>

			<p className="categories-page__notice">
				Categories and product counts come from DummyJSON. Create, edit, and delete changes are local to this session and are not saved to the server.
			</p>

			{productsQuery.isError && (
				<p className="categories-page__warning" role="status">
					Product associations could not be checked. Category deletion is disabled until products load successfully.
				</p>
			)}

			<div className="categories-page__toolbar">
				<p className="categories-page__count" aria-live="polite" aria-atomic="true">
					{categoriesQuery.isPending
						? 'Loading categories...'
						: `Showing ${filteredCategories.length} of ${categories.length} categories`}
				</p>
				<label className="categories-page__search-field" htmlFor="category-search">
					<span className="categories-page__label">Search categories</span>
					<input
						className="categories-page__input"
						id="category-search"
						type="search"
						value={search}
						placeholder="Name or slug"
						onChange={(event) => setSearch(event.target.value)}
					/>
				</label>
			</div>

			{categoriesQuery.isPending ? (
				<p className="categories-page__request-state" role="status">Loading categories...</p>
			) : categoriesQuery.isError && categoriesQuery.data === undefined ? (
				<div className="categories-page__request-state categories-page__request-state--error" role="alert">
					<p>Categories could not be loaded. Check your connection and try again.</p>
					<button type="button" onClick={() => void categoriesQuery.refetch()}>Try again</button>
				</div>
			) : categories.length === 0 ? (
				<p className="categories-page__empty-state">No categories are available.</p>
			) : sortedCategories.length === 0 ? (
				<p className="categories-page__empty-state">No categories match your search.</p>
			) : (
				<div className="categories-page__table-wrap">
					<table className="categories-page__table">
						<caption className="categories-page__caption">Categories and associated product counts</caption>
						<thead>
							<tr>
								<th scope="col" aria-sort={getSortLabel('name')}>
									<button className="categories-page__sort-button" type="button" onClick={() => changeSort('name')}>
										Name <span aria-hidden="true">{sortKey === 'name' ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}</span>
									</button>
								</th>
								<th scope="col">Slug</th>
								<th scope="col" aria-sort={getSortLabel('productCount')}>
									<button className="categories-page__sort-button" type="button" onClick={() => changeSort('productCount')}>
										Product count <span aria-hidden="true">{sortKey === 'productCount' ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}</span>
									</button>
								</th>
								<th scope="col">Actions</th>
							</tr>
						</thead>
						<tbody>
							{sortedCategories.map((category) => (
								<tr key={category.id}>
									<th scope="row" className="categories-page__name">{category.name}</th>
									<td className="categories-page__slug">{category.slug}</td>
									<td>{category.productCount}</td>
									<td>
										<CategoryActions
											category={category}
											canDelete={canCheckProductAssociations && category.productCount === 0}
											busy={isMutating || deleteCategoryMutation.isPending}
											isDeleting={deleteCategoryMutation.variables?.id === category.id && deleteCategoryMutation.isPending}
											onEdit={() => setActiveDialog({ mode: 'edit', categoryId: category.id })}
											onDelete={deleteCategory}
										/>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}

			{productsQuery.isPending && <p className="categories-page__association-state" role="status">Checking product associations...</p>}
			{deleteCategoryMutation.isError && (
				<p className="categories-page__warning" role="alert">
					{deleteCategoryMutation.error.message}
					<button type="button" onClick={() => deleteCategoryMutation.reset()}>Dismiss</button>
				</p>
			)}

			{activeDialog?.mode === 'create' && (
				<CategoryFormDialog
					key="new-category"
					mode="create"
					categories={categoriesWithCounts}
					onClose={() => setActiveDialog(null)}
					onSave={saveCategory}
				/>
			)}
			{activeDialog?.mode === 'edit' && activeCategory && (
				<CategoryFormDialog
					key={activeCategory.id}
					mode="edit"
					category={activeCategory}
					categories={categoriesWithCounts}
					onClose={() => setActiveDialog(null)}
					onSave={saveCategory}
				/>
			)}
		</main>
	);
}