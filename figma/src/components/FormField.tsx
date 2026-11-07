import type { CSSProperties } from "react";

export function FormField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  min,
  max,
  style,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  /** Restricciones nativas del input (útil para no permitir fechas pasadas). */
  min?: string;
  max?: string;
  style?: CSSProperties;
}) {
  return (
    <label className="form-field" style={style}>
      <span>{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        min={min}
        max={max}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
