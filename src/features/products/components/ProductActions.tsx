import type { Product } from '@/features/products/types';

interface ProductActionsProps {
	product: Product;
	onView: () => void;
	onEdit: () => void;
	onDelete: (productId: string) => void;
	deletePending: boolean;
	isDeletingProduct: boolean;
}

export default function ProductActions({
	product,
	onView,
	onEdit,
	onDelete,
	deletePending,
	isDeletingProduct,
}: ProductActionsProps) {
	const handleDelete = () => {
		if (window.confirm(`Delete "${product.title}"? This action cannot be undone.`)) {
			onDelete(product.id);
		}
	};

	return (
		<div className="products-page__row-actions">
			<button
				type="button"
				disabled={isDeletingProduct}
				onClick={onView}
				aria-label={`View details for ${product.title}`}
			>
				View
			</button>
			<button
				type="button"
				disabled={isDeletingProduct}
				onClick={onEdit}
				aria-label={`Edit ${product.title}`}
			>
				Edit
			</button>
			<button
				className="products-page__delete-action"
				type="button"
				disabled={deletePending}
				onClick={handleDelete}
				aria-label={isDeletingProduct ? `Deleting ${product.title}` : `Delete ${product.title}`}
			>
				{isDeletingProduct ? 'Deleting...' : 'Delete'}
			</button>
		</div>
	);
}