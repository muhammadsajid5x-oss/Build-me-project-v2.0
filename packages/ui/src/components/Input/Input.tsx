import {
  useState,
  type ChangeEvent,
  type FocusEvent,
  type ReactNode,
} from "react";

export type InputVariant = "default" | "search";

export interface InputProps {
  readonly id?: string;
  readonly name?: string;
  readonly type?: "text" | "email" | "password" | "search" | "tel" | "url";
  readonly placeholder?: string;
  readonly value?: string;
  readonly defaultValue?: string;
  readonly onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  readonly onFocus?: (event: FocusEvent<HTMLInputElement>) => void;
  readonly onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
  readonly disabled?: boolean;
  readonly readOnly?: boolean;
  readonly required?: boolean;
  readonly variant?: InputVariant;
  readonly startIcon?: ReactNode;
  readonly endIcon?: ReactNode;
  readonly className?: string;
  readonly label?: string;
  readonly error?: string;
  readonly helperText?: string;
  readonly inputRef?: React.Ref<HTMLInputElement>;
}

const baseInputClasses =
  "block w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50";

export function Input({
  id,
  name,
  type = "text",
  placeholder,
  value,
  defaultValue,
  onChange,
  onFocus,
  onBlur,
  disabled,
  readOnly,
  required,
  startIcon,
  endIcon,
  className = "",
  label,
  error,
  helperText,
  inputRef,
}: InputProps) {
  const [, setInternalValue] = useState(defaultValue ?? "");

  const isControlled = value !== undefined;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) {
      setInternalValue(event.target.value);
    }
    onChange?.(event);
  };

  const inputClasses = [
    baseInputClasses,
    startIcon ? "pl-10" : "",
    endIcon ? "pr-10" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const inputElement = (
    <div className="relative">
      {startIcon && (
        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
          {startIcon}
        </span>
      )}
      <input
        ref={inputRef}
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        value={isControlled ? value : undefined}
        defaultValue={isControlled ? undefined : defaultValue}
        onChange={handleChange}
        onFocus={onFocus}
        onBlur={onBlur}
        disabled={disabled}
        readOnly={readOnly}
        required={required}
        className={inputClasses}
      />
      {endIcon && (
        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">
          {endIcon}
        </span>
      )}
    </div>
  );

  if (label) {
    return (
      <div className="space-y-1.5">
        <label
          htmlFor={id}
          className="block text-sm font-medium text-gray-300"
        >
          {label}
        </label>
        {inputElement}
        {error && <p className="text-sm text-red-400">{error}</p>}
        {helperText && !error && (
          <p className="text-xs text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {inputElement}
      {error && <p className="text-sm text-red-400">{error}</p>}
      {helperText && !error && (
        <p className="text-xs text-gray-500">{helperText}</p>
      )}
    </div>
  );
}