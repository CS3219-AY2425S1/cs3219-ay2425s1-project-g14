import { ChangeEvent } from "react";
import style from "@/style/form.module.css";

interface Props {
  label: string;
  group: string;
  options: {
    [label: string]: number;
  };
  required?: boolean;
  disabled?: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

function RadioButtonGroup({
  label,
  group,
  options,
  required,
  disabled,
  onChange,
}: Props) {
  const options_label = Object.keys(options);
  return (
    <div className={style.radio_container}>
      <p className={style.label}>{label}</p>
      {options_label.map((lbl, idx) => (
        <div key={idx}>
          <input
            type="radio"
            id={lbl}
            name={group}
            required={required}
            disabled={disabled}
            value={options[lbl]}
            onChange={onChange}
          />
          <label htmlFor={lbl}>{lbl}</label>
        </div>
      ))}
    </div>
  );
}

export default RadioButtonGroup;
