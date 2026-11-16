import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#000000",
        surface: "#0A0A0A",
        crimson: {
          DEFAULT: "#E50914",
          deep: "#B00020",
          hover: "#f40612",
        },
        border: "#242424",
        muted: "#A1A1AA",
        medusa: {
          canvas: "#000000",
          secondary: "#0A0A0A",
          red: "#E50914",
          deepred: "#B00020",
          text: "#FFFFFF",
          muted: "#A1A1AA",
          border: "#242424",
        }
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono",
          "Fira Code",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      borderRadius: {
        pill: "9999px",
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' }
        },
        pulseRed: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.4', transform: 'scale(0.96)' }
        }
      },
      animation: {
        shimmer: 'shimmer 1.8s infinite',
        pulseRed: 'pulseRed 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      }
    },
  },
  plugins: [],
};
export default config;
