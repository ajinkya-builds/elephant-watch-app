import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Blue color palette (primary) - refined for minimalist design
        blue: {
          50: '#eef6ff',
          100: '#d8e9ff',
          200: '#b0d2ff',
          300: '#7eb6ff',
          400: '#4991ff',
          500: '#1a73e8', // Main blue - maintained for brand consistency
          600: '#1561c5',
          700: '#0d4b8c',
          800: '#0d3c78',
          900: '#072f5f',
        },
        // Green color palette (secondary) - refined
        green: {
          50: '#e6f5ed',
          100: '#c7edd7',
          200: '#a3d9bc',
          300: '#87caac', // Softer green for subtle highlights
          400: '#4eba82',
          500: '#0b8043', // Main green - maintained for brand consistency
          600: '#09683a',
          700: '#07522b',
          800: '#064022',
          900: '#04331c',
        },
        // Teal color palette (accent) - new complementary color
        teal: {
          50: '#e0f7fa',
          100: '#b2ebf2',
          200: '#80deea',
          300: '#4dd0e1',
          400: '#26c6da',
          500: '#00bcd4',
          600: '#00a0b0',
          700: '#00778a',
          800: '#006a75',
          900: '#004d58',
        },
        // Neutral colors - refined for cleaner look
        gray: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1c2434', // Deeper gray for better contrast
          900: '#0f172a',
        },
        // Semantic colors - refined for minimalist design
        border: "hsl(214, 32%, 91%)",
        input: "hsl(214, 32%, 91%)",
        ring: "hsl(213, 82%, 51%)", // Matches blue-500
        background: "#ffffff",
        foreground: "#1c2434", // Deeper gray for better contrast
        primary: {
          DEFAULT: "#1a73e8", // Main blue - maintained for brand consistency
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#0b8043", // Main green - maintained for brand consistency
          foreground: "#ffffff",
        },
        destructive: {
          DEFAULT: "#dc2626", // Red
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "#f1f5f9", // Light gray background
          foreground: "#475569", // Gray-600 for better contrast
        },
        accent: {
          DEFAULT: "#00a0b0", // Teal accent
          foreground: "#ffffff",
        },
        popover: {
          DEFAULT: "#ffffff",
          foreground: "#1c2434", // Deeper gray for better contrast
        },
        card: {
          DEFAULT: "#ffffff",
          foreground: "#1c2434", // Deeper gray for better contrast
        },
      },
      borderRadius: {
        xs: "4px",
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "20px",
        "2xl": "24px",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
