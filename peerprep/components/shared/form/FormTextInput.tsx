import { ChangeEvent, ReactNode } from "react";
import style from "@/style/form.module.css";

type Props = {
  name: string;
  label: string;
  value: string;
  children?: ReactNode;
  className?: string;
  required?: boolean;
  disabled?: boolean;
  id?: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
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
}: Props) {
  return (
    <div className={style.input_container}>
      <p className={style.label}>{label}</p>
      <input
        required={required}
        type="text"
        name={name}
        id={id}
        value={value}
        className={`${style.text_input} ${className ? className : ""}`}
        onChange={onChange}
        disabled={disabled}
      />
      {children}
    </div>
  );
}

export default TextInput;
