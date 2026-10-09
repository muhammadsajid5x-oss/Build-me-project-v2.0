import type { HTMLAttributes, ReactNode } from "react";
import "./Layout.css";

export type ContainerSize = "sm" | "md" | "lg" | "xl" | "2xl";
export type LayoutSpacing =
  | "none"
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl";
export type GridColumns = 1 | 2 | 3 | 4;
export type StackDirection = "vertical" | "horizontal";

export interface ContainerProps extends Readonly<
  HTMLAttributes<HTMLDivElement>
> {
  readonly size?: ContainerSize;
}

export interface SectionProps extends Readonly<HTMLAttributes<HTMLElement>> {
  readonly spacing?: "none" | "sm" | "md" | "lg";
}

export interface GridProps extends Readonly<HTMLAttributes<HTMLDivElement>> {
  readonly columns?: GridColumns;
  readonly gap?: LayoutSpacing;
}

export interface StackProps extends Readonly<HTMLAttributes<HTMLDivElement>> {
  readonly direction?: StackDirection;
  readonly gap?: LayoutSpacing;
}

export interface PageLayoutProps extends Readonly<
  HTMLAttributes<HTMLDivElement>
> {
  readonly header?: ReactNode;
  readonly footer?: ReactNode;
}

export function Container({
  size = "xl",
  className = "",
  ...props
}: ContainerProps) {
  return (
    <div
      {...props}
      className={`ui-container ui-container--${size} ${className}`.trim()}
    />
  );
}

export function Section({
  spacing = "md",
  className = "",
  ...props
}: SectionProps) {
  return (
    <section
      {...props}
      className={`ui-section ui-section--${spacing} ${className}`.trim()}
    />
  );
}

export function Grid({
  columns = 1,
  gap = "md",
  className = "",
  ...props
}: GridProps) {
  return (
    <div
      {...props}
      className={`ui-grid ui-grid--columns-${columns} ui-layout-gap--${gap} ${className}`.trim()}
    />
  );
}

export function Stack({
  direction = "vertical",
  gap = "md",
  className = "",
  ...props
}: StackProps) {
  return (
    <div
      {...props}
      className={`ui-stack ui-stack--${direction} ui-layout-gap--${gap} ${className}`.trim()}
    />
  );
}

export function PageLayout({
  children,
  header,
  footer,
  className = "",
  ...props
}: PageLayoutProps) {
  return (
    <div {...props} className={`ui-page-layout ${className}`.trim()}>
      {header != null ? (
        <header className="ui-page-layout__header">{header}</header>
      ) : null}
      <main className="ui-page-layout__main">{children}</main>
      {footer != null ? (
        <footer className="ui-page-layout__footer">{footer}</footer>
      ) : null}
    </div>
  );
}
