import { useEffect, useRef, useState, type FormEvent, type SyntheticEvent } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { createCategorySchema, type CategoryFormInput, type CategoryFormValues } from '@/features/categories/schema';
import type { Category, CategoryInput } from '@/features/categories/types';

interface CategoryFormDialogBaseProps {
	categories: Category[];
	onClose: () => void;
	onSave: (values: CategoryInput) => Promise<void>;
}

type CategoryFormDialogProps = CategoryFormDialogBaseProps & (
	| { mode: 'create'; category?: never }
	| { mode: 'edit'; category: Category }
);

export default function CategoryFormDialog({ mode, category, categories, onClose, onSave }: CategoryFormDialogProps) {
	const dialogRef = useRef<HTMLDialogElement>(null);
	const submitLock = useRef(false);
	const [feedback, setFeedback] = useState<{ kind: 'success' | 'error'; message: string } | null>(null);
	const { register, handleSubmit, reset, formState: { errors, isDirty, isSubmitting } } = useForm<
		CategoryFormInput,
		undefined,
		CategoryFormValues
	>({
		resolver: zodResolver(createCategorySchema(categories, category?.id)),
		defaultValues: {
			name: category?.name ?? '',
			slug: category?.slug ?? '',
		},
	});

	useEffect(() => {
		const dialog = dialogRef.current;
		if (!dialog) return;

		dialog.showModal();
		return () => {
			if (dialog.open) dialog.close();
		};
	}, []);

	const handleValidSubmit = async (values: CategoryFormValues) => {
		if (feedback?.kind === 'success') return;
		setFeedback(null);
		try {
			await onSave(values);
			reset(values);
			setFeedback({
				kind: 'success',
				message: mode === 'create'
					? 'Category added for this session only. The API does not persist category writes.'
					: 'Category updated for this session only. The API does not persist category writes.',
			});
		} catch (error) {
			setFeedback({
				kind: 'error',
				message: error instanceof Error ? error.message : 'Could not save the category. Please try again.',
			});
		}
	};

	const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
		if (submitLock.current) {
			event.preventDefault();
			return;
		}

		submitLock.current = true;
		void handleSubmit(handleValidSubmit)(event).finally(() => {
			submitLock.current = false;
		});
	};

	const handleCancel = () => {
		if (isDirty && !window.confirm('Discard your unsaved category changes?')) return;
		onClose();
	};

	const handleDialogCancel = (event: SyntheticEvent<HTMLDialogElement>) => {
		event.preventDefault();
		handleCancel();
	};
	const slugIsLocked = Boolean(category && category.productCount > 0);

	return (
		<dialog
			className="categories-page__dialog"
			ref={dialogRef}
			aria-labelledby="category-form-title"
			onCancel={handleDialogCancel}
		>
			<form
				className="categories-page__dialog-content"
				noValidate
				onChange={() => setFeedback(null)}
				onSubmit={handleFormSubmit}
			>
				<div className="categories-page__dialog-heading">
					<h2 id="category-form-title">{mode === 'create' ? 'Add category' : 'Edit category'}</h2>
				</div>
				<label className="categories-page__edit-field" htmlFor="category-form-name">
					<span>Name</span>
					<input
						{...register('name')}
						id="category-form-name"
						autoFocus
						maxLength={60}
						aria-invalid={Boolean(errors.name)}
						aria-describedby={errors.name ? 'category-form-name-error' : undefined}
					/>
					{errors.name?.message && <span className="categories-page__field-error" id="category-form-name-error">{errors.name.message}</span>}
				</label>
				<label className="categories-page__edit-field" htmlFor="category-form-slug">
					<span>Slug</span>
					<input
						{...register('slug')}
						id="category-form-slug"
						maxLength={80}
						readOnly={slugIsLocked}
						aria-invalid={Boolean(errors.slug)}
						aria-describedby={errors.slug ? 'category-form-slug-error' : slugIsLocked ? 'category-form-slug-help' : undefined}
					/>
					{errors.slug?.message && <span className="categories-page__field-error" id="category-form-slug-error">{errors.slug.message}</span>}
					{slugIsLocked && <span className="categories-page__field-help" id="category-form-slug-help">Slug is locked while products use this category.</span>}
				</label>
				{feedback && (
					<p
						className={`categories-page__form-feedback categories-page__form-feedback--${feedback.kind}`}
						role={feedback.kind === 'error' ? 'alert' : 'status'}
					>
						{feedback.message}
					</p>
				)}
				<div className="categories-page__dialog-actions">
					<button className="categories-page__dialog-close" type="button" onClick={handleCancel}>
						{feedback?.kind === 'success' ? 'Done' : 'Cancel'}
					</button>
					<button className="categories-page__add-button" type="submit" disabled={isSubmitting || feedback?.kind === 'success'}>
						{isSubmitting ? 'Saving...' : mode === 'create' ? 'Add category' : 'Save changes'}
					</button>
				</div>
			</form>
		</dialog>
	);
}