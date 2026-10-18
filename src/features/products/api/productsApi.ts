import { apiClient } from '@/api/apiClient';
import type { Product, ProductInput } from '@/features/products/types';
import type {
	ApiProduct,
	ApiProductDeleteResponse,
	ApiProductListResponse,
	ApiProductMutationResponse,
	ApiProductWritePayload,
} from '@/features/products/api/types';

const productFields = 'id,title,category,price,stock,thumbnail,availabilityStatus';
export function mapApiProduct(apiProduct: ApiProduct): Product {
	return {
		id: String(apiProduct.id),
		title: apiProduct.title,
		category: apiProduct.category,
		price: apiProduct.price,
		stock: apiProduct.stock,
		image: apiProduct.thumbnail,
		// API availability is inventory state; it is not the admin's Active/Draft publication status.
		status: 'Active',
	};
}

export async function getProducts(): Promise<Product[]> {
	const response = await apiClient.get<ApiProductListResponse>('/products/category/beauty', {
		params: {
			limit: 0,
			select: productFields,
		},
	});

	return response.data.products.map(mapApiProduct);
}

function toApiWritePayload(product: ProductInput): ApiProductWritePayload {
	return {
		title: product.title,
		category: product.category,
		price: product.price,
		stock: product.stock,
		thumbnail: product.image,
	};
}

function mapMutationProduct(response: ApiProductMutationResponse, fallback: ProductInput): Product {
	return {
		id: String(response.id),
		title: response.title ?? fallback.title,
		category: response.category ?? fallback.category,
		price: response.price ?? fallback.price,
		stock: response.stock ?? fallback.stock,
		image: response.thumbnail ?? fallback.image,
		status: fallback.status,
	};
}

export async function createProduct(product: ProductInput): Promise<Product> {
	const response = await apiClient.post<ApiProductMutationResponse>(
		'/products/add',
		toApiWritePayload(product),
	);

	return {
		...mapMutationProduct(response.data, product),
		id: `session-${crypto.randomUUID()}`,
		isLocalOnly: true,
	};
}

export interface UpdateProductInput {
	product: Product;
	updates: ProductInput;
}

export async function updateProduct({ product, updates }: UpdateProductInput): Promise<Product> {
	const response = await apiClient.put<ApiProductMutationResponse>(
		`/products/${product.id}`,
		toApiWritePayload(updates),
	);

	return mapMutationProduct(response.data, { ...product, ...updates });
}

export async function deleteProduct(productId: string): Promise<string> {
	const response = await apiClient.delete<ApiProductDeleteResponse>(`/products/${productId}`);

	if (!response.data.isDeleted) {
		throw new Error('The API did not confirm product deletion.');
	}

	return String(response.data.id);
}