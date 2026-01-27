import { useQuery } from '@tanstack/react-query';
import { getCategories, getProductsByCategory, getFeaturedProducts } from '@/services/database';


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
        queryKey: productKeys.list(category || 'featured'),
        queryFn: async () => {
            if (category) {
                return getProductsByCategory(category);
            }
            return getFeaturedProducts();
        },
        staleTime: STALE_TIME,
    });
};
