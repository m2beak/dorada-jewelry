import { useQuery } from '@tanstack/react-query';
import { getWheelSettings } from '@/services/database';

export const wheelKeys = {
    all: ['wheel_settings'] as const,
};

const STALE_TIME = 1000 * 60 * 5; // 5 minutes cache time

export const useWheelSettings = () => {
    return useQuery({
        queryKey: wheelKeys.all,
        queryFn: getWheelSettings,
        staleTime: STALE_TIME,
    });
};
