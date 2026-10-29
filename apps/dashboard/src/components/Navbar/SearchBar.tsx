import { useEffect, useRef, useState } from "react";

export interface SearchBarProps {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly placeholder?: string;
  readonly className?: string;
  readonly "aria-label"?: string;
}

export function SearchBar({
  value,
  onChange,
  placeholder = "Search dashboard...",
  className = "",
  "aria-label": ariaLabel = "Search",
}: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync external value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(event.target.value);
    onChange(event.target.value);
  };

  const handleClear = () => {
    setLocalValue("");
    onChange("");
    inputRef.current?.focus();
  };

  return (
    <div className={`relative ${className}`.trim()}>
      <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M7.5 13a5.5 5.5 0 100-11 5.5 5.5 0 000 11zM13 7.5l4 4-1.5 1.5-4-4 1.5-1.5z" />
        </svg>
      </span>
      <input
        ref={inputRef}
        type="search"
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className="block w-full rounded-md border border-gray-700 bg-gray-900 py-2 pl-10 pr-10 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
      {localValue && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-300"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M4 4l8 8M12 4L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </div>
  );
}