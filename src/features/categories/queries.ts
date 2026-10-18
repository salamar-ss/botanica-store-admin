import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createLocalCategory, deleteLocalCategory, updateLocalCategory } from '@/features/categories/api/localCategoriesAdapter';
import { getCategories } from '@/features/categories/api/categoriesApi';
import type { Category, CategoryInput, UpdateCategoryInput } from '@/features/categories/types';

export const categoryQueryKeys = {
	all: ['categories'] as const,
	list: () => [...categoryQueryKeys.all, 'list'] as const,
};

export function useCategoriesQuery() {
	return useQuery({
		queryKey: categoryQueryKeys.list(),
		queryFn: getCategories,
		retry: false,
	});
}

export function useCreateCategoryMutation() {
	const queryClient = useQueryClient();

	return useMutation<Category, Error, CategoryInput>({
		mutationFn: createLocalCategory,
		onSuccess: (createdCategory) => {
			queryClient.setQueryData<Category[]>(categoryQueryKeys.list(), (categories) => [
				createdCategory,
				...(categories ?? []),
			]);
		},
	});
}

export function useUpdateCategoryMutation() {
	const queryClient = useQueryClient();

	return useMutation<Category, Error, UpdateCategoryInput>({
		mutationFn: ({ category, updates }) => updateLocalCategory(category, updates),
		onSuccess: (updatedCategory) => {
			queryClient.setQueryData<Category[]>(categoryQueryKeys.list(), (categories) =>
				(categories ?? []).map((category) => category.id === updatedCategory.id ? updatedCategory : category),
			);
		},
	});
}

export function useDeleteCategoryMutation() {
	const queryClient = useQueryClient();

	return useMutation<string, Error, Category>({
		mutationFn: deleteLocalCategory,
		onSuccess: (deletedCategoryId) => {
			queryClient.setQueryData<Category[]>(categoryQueryKeys.list(), (categories) =>
				(categories ?? []).filter((category) => category.id !== deletedCategoryId),
			);
		},
	});
}