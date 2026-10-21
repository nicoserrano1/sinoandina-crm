import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        obsidian: {
          950: "#070d19",
          900: "#0c1527",
          850: "#111c33",
          800: "#162238",
          700: "#1a2744",
        },
        brand: {
          blue: "#2563eb",
          cyan: "#0284c7",
          emerald: "#059669",
        }
      },
    },
  },
  plugins: [],
};
export default config;
