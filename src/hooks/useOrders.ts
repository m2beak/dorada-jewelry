import { useQuery } from '@tanstack/react-query';
import { getOrders } from '@/services/database';

export const orderKeys = {
    all: ['orders'] as const,
};

export const useOrders = () => {
    return useQuery({
        queryKey: orderKeys.all,
        queryFn: getOrders,
        staleTime: 1000 * 60, // 1 minute
    });
};
