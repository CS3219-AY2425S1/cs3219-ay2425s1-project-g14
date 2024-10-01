"use client";
import React from "react";
import styles from "@/style/elements.module.css";

type PeerprepButtonProps = {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
};

const PeerprepButton: React.FC<PeerprepButtonProps> = ({
  onClick,
  children,
  className,
}) => {
  return (
    <button onClick={onClick} className={`${styles.button} ${className}`}>
      {children}
    </button>
  );
};

export default PeerprepButton;
