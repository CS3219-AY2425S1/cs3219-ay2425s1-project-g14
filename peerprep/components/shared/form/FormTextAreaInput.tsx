import { ChangeEvent } from "react";
import style from "@/style/form.module.css";

type Props = {
  name: string;
  label: string;
  value: string;
  className?: string;
  required?: boolean;
  disabled?: boolean;
  id?: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
};

function TextInput({
  name,
  label,
  value,
  className,
  required,
  id,
  disabled,
  onChange,
}: Props) {
  return (
    <div className={style.input_container}>
      <p className={style.label}>{label}</p>
      <textarea
        required={required}
        name={name}
        id={id}
        value={value}
        className={`${style.text_input} ${className ? className : ""}`}
        onChange={onChange}
        disabled={disabled}
      />
    </div>
  );
}

export default TextInput;
