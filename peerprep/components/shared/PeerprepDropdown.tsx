"use client";
import React from "react";
import styles from "@/style/elements.module.css";
type PeerprepDropdownProps<T> = {
  label: string;
  value: T;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: T[];
  className?: string;
};

const PeerprepDropdown = <T extends string | number>({
  label,
  value,
  onChange,
  options,
  className,
}: PeerprepDropdownProps<T>): JSX.Element => {
  return (
    <div className="flex flex-col space-y-1 space-x-2">
      <label className="text-base font-medium">{label}</label>
      <select
        value={value}
        onChange={onChange}
        className={`${styles.select} ${className}`}
      >
        {options
          .filter((option) => option)
          .map((option) => (
            <option className="capitalize" key={option} value={option}>
              {String(option).charAt(0).toUpperCase() + String(option).slice(1)}
            </option>
          ))}
      </select>
    </div>
  );
};

export default PeerprepDropdown;
