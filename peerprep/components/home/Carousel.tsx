import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

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
    }, 5000);
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
  }, [images.length]);

  return (
    <div className="m-auto flex max-w-screen-md flex-auto items-center">
      <MotionConfig transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}>
        <div className="relative w-full overflow-hidden">
          <div className="relative flex justify-center">
            <motion.div
              animate={{ x: `-${index * 100}%` }}
              className="w-[100 * images.length]% flex"
            >
              {[...images, ...images].map((image, i) => (
                <motion.img
                  key={i}
                  src={image.url}
                  alt={image.alt}
                  width={800}
                  height={800}
                  className="w-[100 / images.length]% h-auto rounded-md border-2 border-white object-cover"
                />
              ))}
            </motion.div>
            <AnimatePresence initial={false}>
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                exit={{ opacity: 0, pointerEvents: "none" }}
                whileHover={{ opacity: 1 }}
                className="absolute left-4 top-1/2 flex h-8 w-8 items-center justify-center rounded-full border border-gray-3 bg-white"
                onClick={prevSlide}
              >
                <ChevronLeftIcon className="h-6 w-6" color={"black"} />
              </motion.button>
            </AnimatePresence>
            <AnimatePresence initial={false}>
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                exit={{ opacity: 0, pointerEvents: "none" }}
                whileHover={{ opacity: 1 }}
                className="absolute right-4 top-1/2 flex h-8 w-8 items-center justify-center rounded-full border border-gray-3 bg-white hover:border-gray-2"
                onClick={nextSlide}
              >
                <ChevronRightIcon className="h-6 w-6" color={"black"} />
              </motion.button>
            </AnimatePresence>
          </div>
        </div>
      </MotionConfig>
    </div>
  );
};

export default Carousel;