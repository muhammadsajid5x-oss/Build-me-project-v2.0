import type { ReactNode } from "react";

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface AvatarProps {
  readonly src?: string | null;
  readonly alt?: string;
  readonly initials?: string;
  readonly size?: AvatarSize;
  readonly className?: string;
  readonly children?: ReactNode;
}

const sizeClasses: Record<AvatarSize, string> = {
  xs: "h-6 w-6 text-xs",
  sm: "h-8 w-8 text-sm",
  md: "h-10 w-10 text-base",
  lg: "h-12 w-12 text-lg",
  xl: "h-16 w-16 text-xl",
};

export function Avatar({
  src,
  alt = "Avatar",
  initials,
  size = "md",
  className = "",
  children,
}: AvatarProps) {
  const classes = `inline-flex items-center justify-center rounded-full bg-blue-600 font-semibold text-white ${sizeClasses[size]} ${className}`.trim();

  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={`${classes} object-cover`}
        loading="lazy"
      />
    );
  }

  if (children) {
    return <span className={classes}>{children}</span>;
  }

  return (
    <span className={classes} aria-label={alt}>
      {initials ?? "??"}
    </span>
  );
}