import { useQuery } from '@tanstack/react-query';
import { getBackgrounds } from '@/services/database';

export const backgroundKeys = {
    all: ['backgrounds'] as const,
};

const STALE_TIME = 1000 * 60 * 10; // 10 minutes cache time since backgrounds change rarely

export const useBackgrounds = () => {
    return useQuery({
        queryKey: backgroundKeys.all,
        queryFn: getBackgrounds,
        staleTime: STALE_TIME,
    });
};
