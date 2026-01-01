import type { SelectHTMLAttributes } from "react";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
}

export default function Select({
  label,
  error,
  helperText,
  options,
  placeholder = "Bitte wählen...",
  className = "",
  id,
  defaultValue,
  value,
  ...props
}: SelectProps) {
  const selectId = id || props.name;

  // Use controlled (value) if provided, otherwise uncontrolled (defaultValue)
  const selectValue = value !== undefined ? value : undefined;
  const selectDefaultValue = value === undefined ? (defaultValue ?? "") : undefined;

  return (
    <div className="form-control">
      {label && (
        <label className="label" htmlFor={selectId}>
          <span className="label-text">{label}</span>
        </label>
      )}
      <select
        id={selectId}
        className={`select select-bordered w-full ${error ? "select-error" : ""} ${className}`}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={
          error
            ? `${selectId}-error`
            : helperText
              ? `${selectId}-helper`
              : undefined
        }
        value={selectValue}
        defaultValue={selectDefaultValue}
        {...props}
      >
        <option disabled value="">
          {placeholder}
        </option>
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <label className="label">
          <span className="label-text-alt text-error" id={`${selectId}-error`}>
            {error}
          </span>
        </label>
      )}
      {helperText && !error && (
        <label className="label">
          <span className="label-text-alt" id={`${selectId}-helper`}>
            {helperText}
          </span>
        </label>
      )}
    </div>
  );
}
