import React from "react";
import styles from "@/style/layout.module.css";

interface Props {
  className: string;
  children: React.ReactNode;
}

function Chip({ className, children }: Props) {
  return <p className={`${styles.chip} ${className}`}>{children}</p>;
}

export default Chip;
