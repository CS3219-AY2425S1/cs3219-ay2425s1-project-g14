import React, { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import {ChevronLeftIcon, ChevronRightIcon} from "@heroicons/react/24/outline";



// code adapted from https://buildui.com/courses/framer-motion-recipes/carousel-part-1

export type ImageProps = {
  url: string;
  alt: string;
};

const Carousel = ({ images }: { images: ImageProps[] }) => {
  const [index, setIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const clearExistingInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const startInterval = () => {
    clearExistingInterval();
    intervalRef.current = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000);
  };

  const prevSlide = () => {
    setIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
    clearExistingInterval();
    startInterval();
  };

  const nextSlide = () => {
    setIndex((prevIndex) => (prevIndex + 1) % images.length);
    clearExistingInterval();
    startInterval();
  };

  useEffect(() => {
    startInterval();

    return () => clearExistingInterval();
  });

  // TODO: make it infinite scroll to not show white background

  return (
    <div className="m-auto flex flex-auto items-center">
      <MotionConfig transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}>
        <div className="relative w-full max-w-7xl overflow-hidden">
          <div className="relative flex justify-center">
            <motion.div
              animate={{ x: `-${index * 33}%` }}
              className="flex"
              style={{ width: `${200 * images.length}%` }}
            >
              {images.map((image, i) => (
                <motion.img
                  key={i}
                  src={image.url}
                  alt={image.alt}
                  width={600}
                  height={600}
                  className="h-auto w-full rounded-md border-2 border-white object-cover"
                />
              ))}
            </motion.div>
            <AnimatePresence initial={false}>
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                exit={{ opacity: 0, pointerEvents: "none" }}
                whileHover={{ opacity: 1 }}
                className="absolute left-4 top-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white"
                onClick={prevSlide}
              >
                <ChevronLeftIcon className="h-6 w-6" />
              </motion.button>
            </AnimatePresence>
            <AnimatePresence initial={false}>
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                exit={{ opacity: 0, pointerEvents: "none" }}
                whileHover={{ opacity: 1 }}
                className="absolute right-4 top-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white"
                onClick={nextSlide}
              >
                <ChevronRightIcon className="h-6 w-6" />
              </motion.button>
            </AnimatePresence>
          </div>
        </div>
      </MotionConfig>
    </div>
  );
};

export default Carousel;
