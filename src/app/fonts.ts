import localFont from "next/font/local";

export const display = localFont({
  src: [
    { path: "../../public/fonts/GeneralSans-Medium.woff2", weight: "500", style: "normal" },
    { path: "../../public/fonts/GeneralSans-Semibold.woff2", weight: "600", style: "normal" },
  ],
  variable: "--ff-display",
  display: "swap",
  fallback: ["Helvetica Neue", "Arial", "sans-serif"],
  adjustFontFallback: "Arial",
});

export const text = localFont({
  src: [
    { path: "../../public/fonts/Switzer-Regular.woff2", weight: "400", style: "normal" },
    { path: "../../public/fonts/Switzer-Medium.woff2", weight: "500", style: "normal" },
  ],
  variable: "--ff-text",
  display: "swap",
  fallback: ["Helvetica Neue", "Arial", "sans-serif"],
  adjustFontFallback: "Arial",
});

export const fontClasses = `${display.variable} ${text.variable}`;
