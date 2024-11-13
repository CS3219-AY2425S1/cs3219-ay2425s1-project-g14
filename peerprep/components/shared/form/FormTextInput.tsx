"use client";

import { ChangeEvent, ReactNode, useState } from "react";
import style from "@/style/form.module.css";
import { Eye, EyeOff } from "lucide-react";

type Props = {
  name: string;
  label: string;
  value?: string;
  children?: ReactNode;
  className?: string;
  required?: boolean;
  disabled?: boolean;
  id?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  isPassword?: boolean;
  tooltip?: string;
};

function TextInput({
  name,
  label,
  value,
  className,
  required,
  id,
  children,
  disabled,
  onChange,
  isPassword,
  tooltip,
}: Props) {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };
  return (
    <div className={style.input_container}>
      <p className={style.label}>{label}</p>
      <input
        required={required}
        type={isPassword && !isVisible ? "password" : "text"}
        name={name}
        id={id}
        value={value}
        className={`${style.text_input} ${className ? className : ""}`}
        onChange={onChange}
        disabled={disabled}
        placeholder={
          isPassword && !isVisible
            ? "********"
            : name[0].toUpperCase() + name.slice(1)
        }
      />

      {isPassword && (
        <button
          type={"button"}
          onClick={toggleVisibility}
          className="max-2xl: absolute inset-y-0 right-3 flex items-center align-middle text-gray-500 hover:text-gray-700 focus:outline-none"
        >
          {isVisible ? (
            <EyeOff className="h-5 w-5" />
          ) : (
            <Eye className="h-5 w-5" />
          )}
        </button>
      )}
      {tooltip && <div>{tooltip}</div>}

      {children}
    </div>
  );
}

export default TextInput;
