import type { Category } from '@/features/categories/types';

interface CategoryActionsProps {
	category: Category;
	canDelete: boolean;
	busy: boolean;
	isDeleting: boolean;
	onEdit: () => void;
	onDelete: (category: Category) => void;
}

export default function CategoryActions({
	category,
	canDelete,
	busy,
	isDeleting,
	onEdit,
	onDelete,
}: CategoryActionsProps) {
	const handleDelete = () => {
		if (!canDelete) return;
		if (window.confirm(`Delete "${category.name}"? This local demo change will not be saved to the server.`)) {
			onDelete(category);
		}
	};

	return (
		<div className="categories-page__row-actions">
			<button type="button" disabled={busy} onClick={onEdit} aria-label={`Edit ${category.name}`}>
				Edit
			</button>
			<button
				className="categories-page__delete-action"
				type="button"
				disabled={!canDelete || busy}
				title={category.productCount > 0 ? 'This category still has associated products.' : undefined}
				onClick={handleDelete}
				aria-label={isDeleting ? `Deleting ${category.name}` : `Delete ${category.name}`}
			>
				{isDeleting ? 'Deleting...' : 'Delete'}
			</button>
			{category.productCount > 0 && <span className="categories-page__in-use">In use</span>}
		</div>
	);
}