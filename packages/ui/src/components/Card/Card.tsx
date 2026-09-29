import type { ReactNode } from "react";
import "./Card.css";

export type CardState = "default" | "loading" | "empty" | "error" | "disabled";
export type CardSize = "small" | "medium" | "large";

export interface CardProps {
  readonly children: ReactNode;
  readonly className?: string;
  readonly state?: CardState;
  readonly size?: CardSize;
}

export interface CardSectionProps {
  readonly children?: ReactNode;
  readonly className?: string;
}

export function Card({
  children,
  className = "",
  state = "default",
  size = "medium",
}: CardProps) {
  const isLoading = state === "loading";
  const isDisabled = state === "disabled";

  return (
    <article
      className={`ui-card ui-card--${size} ui-card--${state} ${className}`.trim()}
      data-state={state}
      data-size={size}
      aria-busy={isLoading || undefined}
      inert={isDisabled}
    >
      {children}
    </article>
  );
}

export function CardHeader({ children, className = "" }: CardSectionProps) {
  return (
    <header className={`ui-card__header ${className}`.trim()}>
      {children}
    </header>
  );
}

export function CardBody({ children, className = "" }: CardSectionProps) {
  return <div className={`ui-card__body ${className}`.trim()}>{children}</div>;
}

export function CardFooter({ children, className = "" }: CardSectionProps) {
  return (
    <footer className={`ui-card__footer ${className}`.trim()}>
      {children}
    </footer>
  );
}
