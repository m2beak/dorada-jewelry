import React from 'react';

export const ProductSkeleton: React.FC = () => {
    return (
        <div className="glass-card overflow-hidden animate-pulse">
            {/* Image Placeholder */}
            <div className="aspect-square bg-white/5 relative">
                <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/10" />
            </div>

            {/* Content Placeholder */}
            <div className="p-4 space-y-3">
                <div className="flex justify-between items-start gap-2">
                    <div className="h-4 bg-white/5 rounded w-2/3" />
                    <div className="h-3 bg-white/5 rounded w-1/4" />
                </div>

                <div className="h-3 bg-white/5 rounded w-1/2" />

                <div className="flex flex-wrap gap-1">
                    <div className="h-5 bg-white/5 rounded w-16" />
                    <div className="h-5 bg-white/5 rounded w-12" />
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-white/5 mt-2">
                    <div className="h-6 bg-white/5 rounded w-20" />
                    <div className="h-10 bg-white/5 rounded-xl w-10" />
                </div>
            </div>
        </div>
    );
};
