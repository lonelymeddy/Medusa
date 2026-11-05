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
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        jules: {
          blue: "#1a73e8",
          darkblue: "#174ea6",
          cyan: "#24c1e0",
          surface: "#0e131f",
          panel: "#161d2e",
          card: "#1e293b",
          border: "#2e3a53",
          textMuted: "#8b949e",
          codeBg: "#0b0f19",
          green: "#00d26a",
          amber: "#f59e0b",
          red: "#f43f5e"
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
      fontSize: {
        'jules-micro': ['0.6875rem', { lineHeight: '0.875rem', letterSpacing: '0.04em' }],
        'jules-xs': ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.02em' }],
        'jules-sm': ['0.8125rem', { lineHeight: '1.25rem' }],
        'jules-base': ['0.875rem', { lineHeight: '1.375rem' }],
        'jules-md': ['0.9375rem', { lineHeight: '1.5rem' }],
        'jules-lg': ['1.0625rem', { lineHeight: '1.625rem' }],
        'jules-xl': ['1.25rem', { lineHeight: '1.75rem' }],
        'jules-2xl': ['1.5rem', { lineHeight: '2rem' }],
        'jules-code': ['0.8125rem', { lineHeight: '1.375rem' }],
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' }
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' }
        }
      },
      animation: {
        shimmer: 'shimmer 1.8s infinite',
        pulseSubtle: 'pulseSubtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      }
    },
  },
  plugins: [],
};
export default config;
