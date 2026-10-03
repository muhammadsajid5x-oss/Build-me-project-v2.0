import { typography } from "./typography";
export { typography };
export const theme = {
  colors: {
    primary: "#2563eb",
    secondary: "#111827",
    background: "#ffffff",
    foreground: "#111827",
    muted: "#6b7280",
    border: "#e5e7eb",
  },
  typography,
  spacing: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
    "2xl": "3rem",
    "3xl": "4rem",
  },
  sizing: {
    container: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    icon: {
      sm: "1rem",
      md: "1.25rem",
      lg: "1.5rem",
    },
  },
  breakpoints: {
    mobile: "640px",
    tablet: "768px",
    desktop: "1024px",
    large: "1280px",
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
  },
  responsive: {
    mobile: "sm",
    tablet: "md",
    desktop: "lg",
    large: "xl",
    wide: "xl",
  },
  radius: {
    sm: "0.25rem",
    md: "0.5rem",
    lg: "0.75rem",
    xl: "1rem",
    full: "9999px",
  },
  config: {
    mode: "light",
    defaultFontFamily: "sans",
    spacingUnit: "rem",
    responsiveStrategy: "mobile-first",
  },
} as const;
export type Theme = typeof theme;
