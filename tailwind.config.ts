import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        green: {
          DEFAULT: "#0a8c2a",
          light: "#12b83a",
          dark: "#065c1a",
        },
        yellow: { DEFAULT: "#f5c800" },
        blue: { DEFAULT: "#0057b7" },
        dark: {
          DEFAULT: "#0d0d0d",
          2: "#141414",
          3: "#1a1a1a",
        },
      },
      fontFamily: {
        bebas: ["var(--font-bebas)", "sans-serif"],
        barlow: ["var(--font-barlow)", "sans-serif"],
        "barlow-condensed": ["var(--font-barlow-condensed)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
