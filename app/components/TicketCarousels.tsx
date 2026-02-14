"use client";
import { useEffect, useState, useMemo } from "react";
import { FaYoutube } from "react-icons/fa";

// --- CONFIG ---
const DEFAULT_SLIDE_DURATION = 5000;
const DEFAULT_ANIMATION_DURATION = 1000;

interface CarouselProps {
  images: string[];
  links?: string[];
  slideDuration?: number;
  animationDuration?: number;
  showIndicators?: boolean;
  blur?: string;
  onIndexChange?: (index: number) => void;
}

// 🖼️ 1. Thumbnail Carousel
export const CarouselThumbnail = ({
  images,
  links = [],
  slideDuration = DEFAULT_SLIDE_DURATION,
  animationDuration = DEFAULT_ANIMATION_DURATION,
  showIndicators = false,
  onIndexChange,
}: CarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);

  const extendedImages = useMemo(() => [...images, images[0]], [images]);
  const extendedLinks = useMemo(() => [...links, links[0]], [links]);

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(
      () => setCurrentIndex((prev) => prev + 1),
      slideDuration,
    );
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

  useEffect(() => {
    if (!onIndexChange || images.length === 0) return;
    onIndexChange(currentIndex % images.length);
  }, [currentIndex, images.length, onIndexChange]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-gray-100 dark:bg-black">
      <div
        className="flex h-full"
        style={{
          width: `${extendedImages.length * 100}%`,
          transform: `translateX(-${(currentIndex * 100) / extendedImages.length}%)`,
          transition: isTransitioning
            ? `transform ${animationDuration}ms ease-in-out`
            : "none",
        }}
      >
        {extendedImages.map((img, i) => (
          <div key={i} className="relative w-full h-full">
            <a
              href={extendedLinks[i] || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full h-full relative group/thumb"
              onPointerDown={(e) => e.stopPropagation()}
            >
              <img
                src={img}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
              />

              <div
                className="absolute inset-0 flex items-center justify-center transition-colors duration-300 
                bg-black/10 group-hover/thumb:bg-black/20"
              >
                <FaYoutube
                  className="text-white drop-shadow-md text-[14px] transition-all duration-300 transform 
                  group-hover/thumb:text-red-600 group-hover/thumb:scale-125 group-hover/thumb:opacity-100"
                />
              </div>
            </a>
          </div>
        ))}
      </div>

      {showIndicators && images.length > 1 && (
        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 z-20 pointer-events-none">
          {images.map((_, i) => {
            const isActive = currentIndex % images.length === i;
            return (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 shadow-sm
                  ${isActive ? "w-4 bg-white" : "w-1.5 bg-white/60"}
                `}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

// 🌫️ 2. Background Carousel
export const BackgroundCarousel = ({
  images,
  slideDuration = DEFAULT_SLIDE_DURATION,
  blur = "blur-sm",
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
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-transparent">
      {images.map((img, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            i === currentIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* ☀️ Light Mode: 100% Opacity 
              🌙 Dark Mode: 50% Opacity, Low Grayscale (Matches AdminTicketCard settings) 
          */}
          <div
            className={`absolute inset-0 bg-cover bg-center transition-all duration-700
              opacity-100 filter brightness-110 contrast-105
              dark:opacity-50 dark:filter dark:grayscale-[0.2] dark:brightness-100 dark:contrast-100
              ${blur}
            `}
            style={{ backgroundImage: `url('${img}')` }}
          />
        </div>
      ))}
    </div>
  );
};
