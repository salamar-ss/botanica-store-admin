export type CategorySlug = string;

export interface Category {
	id: string;
	name: string;
	slug: CategorySlug;
	productCount: number;
	isLocalOnly: boolean;
}

export interface CategoryInput {
	name: string;
	slug: CategorySlug;
}

export interface UpdateCategoryInput {
	category: Category;
	updates: CategoryInput;
}