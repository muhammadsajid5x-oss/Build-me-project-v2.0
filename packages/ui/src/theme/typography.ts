export const typography = {
  fontFamily: {
    sans: 'Inter, "Plus Jakarta Sans", "Geist Sans", system-ui, sans-serif',
    mono: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },
  headings: {
    h1: {
      fontSize: "2.25rem",
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: "1.875rem",
      fontWeight: 700,
      lineHeight: 1.25,
    },
    h3: {
      fontSize: "1.5rem",
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h4: {
      fontSize: "1.25rem",
      fontWeight: 600,
      lineHeight: 1.35,
    },
    h5: {
      fontSize: "1.125rem",
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: "1rem",
      fontWeight: 600,
      lineHeight: 1.5,
    },
  },
  body: {
    large: {
      fontSize: "1.125rem",
      fontWeight: 400,
      lineHeight: 1.75,
    },
    default: {
      fontSize: "1rem",
      fontWeight: 400,
      lineHeight: 1.5,
    },
    small: {
      fontSize: "0.875rem",
      fontWeight: 400,
      lineHeight: 1.5,
    },
  },
  label: {
    default: {
      fontSize: "0.875rem",
      fontWeight: 500,
      lineHeight: 1.5,
    },
    small: {
      fontSize: "0.75rem",
      fontWeight: 500,
      lineHeight: 1.5,
    },
  },
  caption: {
    fontSize: "0.75rem",
    fontWeight: 400,
    lineHeight: 1.5,
  },
  fontSize: {
    xs: "0.75rem",
    sm: "0.875rem",
    md: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
    "4xl": "2.25rem",
  },
  fontWeight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;
export type Typography = typeof typography;
