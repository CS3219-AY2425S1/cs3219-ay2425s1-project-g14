"use client";
import React from "react";
import styles from "@/style/elements.module.css";

type PeerprepButtonProps = {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean
};

const PeerprepButton: React.FC<PeerprepButtonProps> = ({
  onClick,
  children,
  className,
  disabled
}) => {
  return (
    <button onClick={onClick} className={`${styles.button} ${className}`} disabled={disabled}>
      {children}
    </button>
  );
};

export default PeerprepButton;
