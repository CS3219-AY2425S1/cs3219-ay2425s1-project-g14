// PeerprepSearchBar.tsx
import React from "react";
import styles from "@/style/elements.module.css";

interface PeerprepSearchBarProps {
  value: string;
  label?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const PeerprepSearchBar: React.FC<PeerprepSearchBarProps> = ({
  value,
  label = "Search...",
  onChange,
}) => {
  return (
    <div className="flex flex-col">
      <input
        type="text"
        placeholder={label}
        value={value}
        onChange={onChange}
        className={styles.input}
      />
    </div>
  );
};

export default PeerprepSearchBar;
