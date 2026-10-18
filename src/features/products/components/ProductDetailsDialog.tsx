import { useEffect, useRef } from 'react';
import type { Product } from '@/features/products/types';

interface ProductDetailsDialogProps {
	product: Product;
	categoryLabel: string;
	onClose: () => void;
}

const currencyFormatter = new Intl.NumberFormat('en-IE', {
	style: 'currency',
	currency: 'EUR',
});

export default function ProductDetailsDialog({ product, categoryLabel, onClose }: ProductDetailsDialogProps) {
	const dialogRef = useRef<HTMLDialogElement>(null);

	useEffect(() => {
		const dialog = dialogRef.current;
		if (!dialog) return;

		dialog.showModal();
		return () => dialog.close();
	}, []);

	return (
		<dialog
			className="products-page__dialog"
			ref={dialogRef}
			aria-labelledby="product-details-title"
			onCancel={onClose}
		>
			<div className="products-page__dialog-content">
				<div className="products-page__dialog-heading">
					<h2 id="product-details-title">Product details</h2>
					<button className="products-page__dialog-close" type="button" onClick={onClose}>
						Close
					</button>
				</div>
				<div className="products-page__detail-product">
					<img className="products-page__detail-image" src={product.image} alt="" />
					<div>
						<h3>{product.title}</h3>
						<p>{categoryLabel}</p>
					</div>
				</div>
				<dl className="products-page__detail-list">
					<div><dt>Product ID</dt><dd>{product.id}</dd></div>
					<div><dt>Price</dt><dd>{currencyFormatter.format(product.price)}</dd></div>
					<div><dt>Stock</dt><dd>{product.stock}</dd></div>
					<div><dt>Status</dt><dd>{product.status}</dd></div>
				</dl>
			</div>
		</dialog>
	);
}