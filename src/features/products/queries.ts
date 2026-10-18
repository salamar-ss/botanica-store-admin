import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
	createProduct,
	deleteProduct,
	getProducts,
	updateProduct,
	type UpdateProductInput,
} from '@/features/products/api/productsApi';
import type { Product, ProductInput } from '@/features/products/types';

export const productQueryKeys = {
	all: ['products'] as const,
	list: () => [...productQueryKeys.all, 'list'] as const,
};

export function useProductsQuery() {
	return useQuery({
		queryKey: productQueryKeys.list(),
		queryFn: getProducts,
		retry: false,
		staleTime: Infinity,
	});
}

export function useCreateProductMutation() {
	const queryClient = useQueryClient();

	return useMutation<Product, Error, ProductInput>({
		mutationFn: createProduct,
		onSuccess: (createdProduct) => {
			queryClient.setQueryData<Product[]>(productQueryKeys.list(), (currentProducts) => [
				createdProduct,
				...(currentProducts ?? []).filter((product) => product.id !== createdProduct.id),
			]);
		},
	});
}

export function useUpdateProductMutation() {
	const queryClient = useQueryClient();

	return useMutation<Product, Error, UpdateProductInput>({
		mutationFn: ({ product, updates }) => product.isLocalOnly
			? Promise.resolve({ ...product, ...updates })
			: updateProduct({ product, updates }),
		onSuccess: (updatedProduct) => {
			queryClient.setQueryData<Product[]>(productQueryKeys.list(), (currentProducts) =>
				(currentProducts ?? []).map((product) =>
					product.id === updatedProduct.id ? updatedProduct : product,
				),
			);
		},
	});
}

export function useDeleteProductMutation() {
	const queryClient = useQueryClient();

	return useMutation<string, Error, string>({
		mutationFn: (productId) => {
			const product = queryClient
				.getQueryData<Product[]>(productQueryKeys.list())
				?.find((item) => item.id === productId);

			return product?.isLocalOnly ? Promise.resolve(productId) : deleteProduct(productId);
		},
		onSuccess: (deletedProductId) => {
			queryClient.setQueryData<Product[]>(productQueryKeys.list(), (currentProducts) =>
				(currentProducts ?? []).filter((product) => product.id !== deletedProductId),
			);
		},
	});
}