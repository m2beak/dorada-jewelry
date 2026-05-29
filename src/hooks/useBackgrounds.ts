import { useQuery } from '@tanstack/react-query';
import { getBackgrounds } from '@/services/database';

export const backgroundKeys = {
    all: ['backgrounds'] as const,
};

const STALE_TIME = 1000 * 60 * 10; // 10 minutes cache time since backgrounds change rarely

export const useBackgrounds = () => {
    return useQuery({
        queryKey: backgroundKeys.all,
        queryFn: async () => {
            const data = await getBackgrounds();
            try {
                localStorage.setItem('dorada_backgrounds', JSON.stringify(data));
            } catch (e) {
                console.error('Failed to cache backgrounds:', e);
            }
            return data;
        },
        staleTime: STALE_TIME,
        initialData: () => {
            try {
                const cached = localStorage.getItem('dorada_backgrounds');
                return cached ? JSON.parse(cached) : undefined;
            } catch (e) {
                return undefined;
            }
        }
    });
};
