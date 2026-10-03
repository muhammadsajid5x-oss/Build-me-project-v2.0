import type { ButtonHTMLAttributes } from "react";

export interface ButtonProps extends Readonly<
  ButtonHTMLAttributes<HTMLButtonElement>
> {
  readonly variant?: "primary" | "secondary";
}

export function Button({
  variant = "primary",
  children,
  ...props
}: ButtonProps) {
  return (
    <button type="button" data-variant={variant} {...props}>
      {children}
    </button>
  );
}
