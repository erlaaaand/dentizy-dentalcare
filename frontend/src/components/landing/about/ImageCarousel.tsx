// frontend/src/components/landing/about/ImageCarousel.tsx
import React from "react";

interface ImageCarouselProps {
  images: Array<{ src: string; desc: string }>;
  currentIndex: number;
  onNext: () => void;
  onPrev: () => void;
  onSelectImage: (index: number) => void;
}

export function ImageCarousel({
  images,
  currentIndex,
  onNext,
  onPrev,
  onSelectImage,
}: ImageCarouselProps) {
  return (
    <div className="relative group">
      <div className="relative rounded-2xl overflow-hidden shadow-2xl">
        {/* Image Container */}
        <div className="relative w-full h-[500px] overflow-hidden">
          {images.map((img, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 transition-opacity duration-700 ${
                idx === currentIndex ? "opacity-100" : "opacity-0"
              }`}
            >
              <img
                src={img.src}
                alt={img.desc}
                className="w-full h-full object-cover"
              />
            </div>
          ))}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

          {/* Navigation Buttons */}
          <button
            onClick={onPrev}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300 opacity-0 group-hover:opacity-100"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <button
            onClick={onNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300 opacity-0 group-hover:opacity-100"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          {/* Image Indicators */}
          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => onSelectImage(idx)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  idx === currentIndex ? "bg-white w-6" : "bg-white/50"
                }`}
              />
            ))}
          </div>

          {/* Stats Badges */}
          <div className="absolute top-6 left-6 bg-white/95 backdrop-blur-sm rounded-xl px-4 py-3 shadow-lg">
            <div className="text-2xl font-bold text-gray-800">1000+</div>
            <div className="text-sm text-gray-600">Pasien Puas</div>
          </div>

          <div className="absolute top-6 right-6 bg-emerald-500/95 backdrop-blur-sm rounded-xl px-4 py-3 shadow-lg text-white">
            <div className="text-2xl font-bold">99%</div>
            <div className="text-sm opacity-90">Kepuasan</div>
          </div>

          {/* Bottom Badge */}
          <div className="absolute bottom-6 left-6 right-6">
            <div className="bg-white/95 backdrop-blur-sm rounded-xl px-6 py-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-gray-800 text-base">
                    Fasilitas Premium
                  </div>
                  <div className="text-sm text-gray-600">
                    {images[currentIndex].desc}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
