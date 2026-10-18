import { useEffect, useRef, useState, type FormEvent, type SyntheticEvent } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import type { ProductCategoryOption } from '@/features/categories/categoryMapping';
import { productSchema, type ProductFormInput, type ProductFormValues } from '@/features/products/schema';
import type { Product } from '@/features/products/types';

interface ProductFormDialogBaseProps {
	categories: ProductCategoryOption[];
	onClose: () => void;
	onSave: (values: ProductFormValues) => Promise<void>;
}

type ProductFormDialogProps = ProductFormDialogBaseProps & (
	| { mode: 'create'; product?: never }
	| { mode: 'edit'; product: Product }
);

export default function ProductFormDialog({ mode, product, categories, onClose, onSave }: ProductFormDialogProps) {
	const dialogRef = useRef<HTMLDialogElement>(null);
	const submitLock = useRef(false);
	const [feedback, setFeedback] = useState<{
		kind: 'success' | 'error';
		message: string;
	} | null>(null);
	const { register, handleSubmit, reset, formState: { errors, isDirty, isSubmitting } } = useForm<
		ProductFormInput,
		undefined,
		ProductFormValues
	>({
		resolver: zodResolver(productSchema),
		defaultValues: {
			title: product?.title ?? '',
			category: product?.category ?? '',
			price: product ? String(product.price) : '',
			stock: product ? String(product.stock) : '',
			status: product?.status ?? 'Active',
			image: product?.image ?? '',
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

	const handleValidSubmit = async (values: ProductFormValues) => {
		if (feedback?.kind === 'success') return;
		setFeedback(null);
		try {
			await onSave(values);
			reset({ ...values, price: String(values.price), stock: String(values.stock) });
			setFeedback({
				kind: 'success',
				message: mode === 'create'
					? 'Product added for this session. The demo API does not persist writes.'
					: 'Changes saved for this session. The demo API does not persist writes.',
			});
		} catch {
			setFeedback({ kind: 'error', message: 'Could not save the product. Please try again.' });
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
		if (isDirty && !window.confirm('Discard your unsaved product changes?')) return;
		onClose();
	};

	const handleDialogCancel = (event: SyntheticEvent<HTMLDialogElement>) => {
		event.preventDefault();
		handleCancel();
	};

	return (
		<dialog
			className="products-page__dialog"
			ref={dialogRef}
			aria-labelledby="product-form-title"
			onCancel={handleDialogCancel}
		>
			<form
				className="products-page__dialog-content"
				noValidate
				onChange={() => setFeedback(null)}
				onSubmit={handleFormSubmit}
			>
				<div className="products-page__dialog-heading">
					<h2 id="product-form-title">{mode === 'create' ? 'Add product' : 'Edit product'}</h2>
				</div>
				<div className="products-page__edit-field">
					<label htmlFor="product-form-title-input">Product name</label>
					<input
						{...register('title')}
						id="product-form-title-input"
						autoFocus
						aria-invalid={Boolean(errors.title)}
						aria-describedby={errors.title ? 'product-form-title-error' : undefined}
					/>
					{errors.title?.message && <span className="products-page__field-error" id="product-form-title-error">{errors.title.message}</span>}
				</div>
				<div className="products-page__edit-field">
					<label htmlFor="product-form-category">Category</label>
					<select
						{...register('category')}
						id="product-form-category"
						aria-invalid={Boolean(errors.category)}
						aria-describedby={errors.category ? 'product-form-category-error' : undefined}
					>
						<option value="">Select a category</option>
						{categories.map((categoryOption) => (
							<option
								key={categoryOption.slug}
								value={categoryOption.slug}
								disabled={!categoryOption.isAvailable && product?.category !== categoryOption.slug}
							>
								{categoryOption.label}
							</option>
						))}
					</select>
					{errors.category?.message && <span className="products-page__field-error" id="product-form-category-error">{errors.category.message}</span>}
					{categories.length === 0 && <span className="products-page__field-error">No category choices are available.</span>}
				</div>
				<div className="products-page__edit-grid">
					<div className="products-page__edit-field">
						<label htmlFor="product-form-price">Price (€)</label>
						<input
							{...register('price')}
							id="product-form-price"
							type="number"
							min="0.01"
							step="0.01"
							aria-invalid={Boolean(errors.price)}
							aria-describedby={errors.price ? 'product-form-price-error' : undefined}
						/>
						{errors.price?.message && <span className="products-page__field-error" id="product-form-price-error">{errors.price.message}</span>}
					</div>
					<div className="products-page__edit-field">
						<label htmlFor="product-form-stock">Stock</label>
						<input
							{...register('stock')}
							id="product-form-stock"
							type="number"
							min="0"
							step="1"
							aria-invalid={Boolean(errors.stock)}
							aria-describedby={errors.stock ? 'product-form-stock-error' : undefined}
						/>
						{errors.stock?.message && <span className="products-page__field-error" id="product-form-stock-error">{errors.stock.message}</span>}
					</div>
				</div>
				<div className="products-page__edit-field">
					<label htmlFor="product-form-image">Image URL</label>
					<input
						{...register('image')}
						id="product-form-image"
						type="url"
						placeholder="https://example.com/product.jpg"
						aria-invalid={Boolean(errors.image)}
						aria-describedby={errors.image ? 'product-form-image-error' : undefined}
					/>
					{errors.image?.message && <span className="products-page__field-error" id="product-form-image-error">{errors.image.message}</span>}
				</div>
				<label className="products-page__edit-field" htmlFor="product-form-status">
					<span>Status</span>
					<select {...register('status')} id="product-form-status">
						<option value="Active">Active</option>
						<option value="Draft">Draft</option>
					</select>
				</label>
				{feedback && (
					<p
						className={`products-page__form-feedback products-page__form-feedback--${feedback.kind}`}
						role={feedback.kind === 'error' ? 'alert' : 'status'}
					>
						{feedback.message}
					</p>
				)}
				<div className="products-page__dialog-actions">
					<button className="products-page__dialog-close" type="button" onClick={handleCancel}>
						{feedback?.kind === 'success' ? 'Done' : 'Cancel'}
					</button>
					<button
						className="products-page__add-button"
						type="submit"
						disabled={isSubmitting || feedback?.kind === 'success'}
					>
						{isSubmitting
							? 'Saving...'
							: feedback?.kind === 'success'
								? 'Saved'
								: mode === 'create' ? 'Add product' : 'Save changes'}
					</button>
				</div>
			</form>
		</dialog>
	);
}