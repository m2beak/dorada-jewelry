import { useQuery } from '@tanstack/react-query';
import { getCategories, getProductsByCategory, getProducts } from '@/services/database';


// Cache keys
export const productKeys = {
    all: ['products'] as const,
    lists: () => [...productKeys.all, 'list'] as const,
    list: (filter: string) => [...productKeys.lists(), filter] as const,
    categories: ['categories'] as const,
};

// 5 minutes cache time (staleTime)
const STALE_TIME = 1000 * 60 * 5;

export const useCategories = () => {
    return useQuery({
        queryKey: productKeys.categories,
        queryFn: getCategories,
        staleTime: STALE_TIME,
    });
};

export const useProducts = (category?: string | null) => {
    return useQuery({
        queryKey: productKeys.list(category || 'all'),
        queryFn: async () => {
            // If category is provided and not empty, filter by category
            if (category) {
                return getProductsByCategory(category);
            }
            // Otherwise, return ALL products (not just featured)
            return getProducts();
        },
        staleTime: STALE_TIME,
    });
};

export const useAllProducts = () => {
    return useQuery({
        queryKey: productKeys.list('all'),
        queryFn: getProducts, // Imported from services/database
        staleTime: STALE_TIME,
    });
};
