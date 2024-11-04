"use client";
import { motion } from "framer-motion";
import { ReactNode } from "react";

// Code adapted from https://staticmania.com/blog/how-to-use-framer-motion-for-animations-in-next-js

export const fadeUpVariant = {
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
    },
  },
  exit: { opacity: 0 },
};

const FadeUpAnimation = ({ children }: { children: ReactNode }) => {
  return (
    <motion.div variants={fadeUpVariant} initial="initial" animate="animate">
      {children}
    </motion.div>
  );
};

export default FadeUpAnimation;
