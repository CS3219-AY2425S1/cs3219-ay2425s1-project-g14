import React from "react";
import styles from "@/style/addquestion.module.css";

type TooltipProps = {
  text: string;
  children: React.ReactNode;
};

const Tooltip = ({ text, children }: TooltipProps) => {
  return (
    <div className={styles.tooltipWrapper}>
      {children}
      <span className={styles.tooltip}>{text}</span>
    </div>
  );
};

export default Tooltip;
