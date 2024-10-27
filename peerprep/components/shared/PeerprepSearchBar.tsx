// PeerprepSearchBar.tsx
import React from "react";
import styles from "@/style/elements.module.css";
import { MagnifyingGlassIcon } from "@heroicons/react/16/solid";

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
    <div className="relative">
      <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
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
