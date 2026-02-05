"use client";
import { useEffect, useState, useMemo } from "react";

// --- CONFIG ---
const DEFAULT_SLIDE_DURATION = 5000;
const DEFAULT_ANIMATION_DURATION = 1000;

interface CarouselProps {
  images: string[];
  slideDuration?: number;
  animationDuration?: number;
  showIndicators?: boolean;
  blur?: string; // 👈 New Prop (e.g., "blur-sm", "blur-none")
}

// 🖼️ 1. Thumbnail Carousel (Sliding)
export const CarouselThumbnail = ({ 
  images, 
  slideDuration = DEFAULT_SLIDE_DURATION,
  animationDuration = DEFAULT_ANIMATION_DURATION,
  showIndicators = false 
}: CarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  
  const extendedImages = useMemo(() => [...images, images[0]], [images]);

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => setCurrentIndex((prev) => prev + 1), slideDuration);
    return () => clearInterval(interval);
  }, [images.length, slideDuration]);

  useEffect(() => {
    if (currentIndex === images.length) {
      const timeout = setTimeout(() => {
        setIsTransitioning(false); 
        setCurrentIndex(0);        
      }, animationDuration);
      return () => clearTimeout(timeout);
    }
    
    if (currentIndex === 0 && !isTransitioning) {
      requestAnimationFrame(() => {
          requestAnimationFrame(() => {
             setIsTransitioning(true);
          });
      });
    }
  }, [currentIndex, images.length, isTransitioning, animationDuration]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-black">
      <div 
        className="flex h-full"
        style={{ 
          width: `${extendedImages.length * 100}%`,
          transform: `translateX(-${(currentIndex * 100) / extendedImages.length}%)`,
          transition: isTransitioning ? `transform ${animationDuration}ms ease-in-out` : 'none'
        }}
      >
        {extendedImages.map((img, i) => (
          <div key={i} className="relative w-full h-full">
            <img src={img} alt="" className="absolute inset-0 w-full h-full object-cover" />
          </div>
        ))}
      </div>

      {showIndicators && (
        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 z-20 pointer-events-none">
          {images.map((_, i) => {
            const isActive = (currentIndex % images.length) === i;
            return (
              <div 
                key={i} 
                className={`h-1.5 rounded-full transition-all duration-300 shadow-sm
                  ${isActive ? 'w-4 bg-white' : 'w-1.5 bg-white/40'}
                `}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

// 🌫️ 2. Background Carousel (Cross-Fade)
export const BackgroundCarousel = ({ 
  images, 
  slideDuration = DEFAULT_SLIDE_DURATION,
  blur = "blur-sm" // 👈 Default blur
}: CarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, slideDuration); 
    return () => clearInterval(interval);
  }, [images.length, slideDuration]);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-[#1e1e1e]">
      {images.map((img, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            i === currentIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          <div 
            className={`absolute inset-0 bg-cover bg-center scale-110 opacity-70 ${blur}`} // 👈 Applied here
            style={{ backgroundImage: `url('${img}')` }}
          />
          <div className="absolute inset-0 bg-black/80" />
        </div>
      ))}
    </div>
  );
};