"use client";
import React from "react";
import styles from "@/style/elements.module.css";

type PeerprepButtonProps = {
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
};

const PeerprepButton: React.FC<PeerprepButtonProps> = ({
  onClick,
  children,
  className,
  disabled,
  type,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      type={type}
      className={`${styles.button} ${className}`}
    >
      {children}
    </button>
  );
};

export default PeerprepButton;
