import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getOptimizedUrl } from '@/utils/image';

interface ImageGalleryProps {
  images: string[];
  alt: string;
  className?: string;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, alt, className = '' }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className={`bg-dorada-blue/30 rounded-xl flex items-center justify-center ${className}`}>
        <span className="text-dorada-cream/40">لا توجد صور</span>
      </div>
    );
  }

  const goToPrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className={`relative group ${className}`}>
      {/* Main Image */}
      <div className="relative w-full h-full overflow-hidden rounded-xl">
        <img
          src={getOptimizedUrl(images[currentIndex], 800)}
          alt={`${alt} - ${currentIndex + 1}`}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500"
        />

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/50 text-white text-sm">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 mt-3 justify-center">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${index === currentIndex
                ? 'border-dorada-gold'
                : 'border-transparent hover:border-dorada-gold/50'
                }`}
            >
              <img
                src={getOptimizedUrl(image, 150)}
                alt={`${alt} thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
