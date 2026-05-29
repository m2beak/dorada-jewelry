import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getReviews, getAllReviews, addReview, deleteReview } from '@/services/database';


export const reviewKeys = {
    all: ['reviews'] as const,
    list: (productId?: string) => [...reviewKeys.all, productId || 'general'] as const,
};

const STALE_TIME = 1000 * 60 * 2; // 2 minutes

export const useReviews = (productId?: string) => {
    return useQuery({
        queryKey: reviewKeys.list(productId),
        queryFn: () => getReviews(productId),
        staleTime: STALE_TIME,
    });
};

export const useAllReviews = () => {
    return useQuery({
        queryKey: ['reviews', 'all'],
        queryFn: getAllReviews,
        staleTime: STALE_TIME,
    });
};

export const useAddReviewMutation = (productId?: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: addReview,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: reviewKeys.list(productId) });
        },
    });
};

export const useDeleteReviewMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteReview,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: reviewKeys.all });
        },
    });
};
