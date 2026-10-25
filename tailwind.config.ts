import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";


export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['"Open Sans"', "system-ui", "sans-serif"],
        display: ["Archivo", '"Open Sans"', "system-ui", "sans-serif"],
      },
      // Brand cap: manuál používá max. Bold (Open Sans) / Medium (Archivo) – nejtučnější utility se omezují
      fontWeight: {
        extrabold: "600",
        black: "700",
      },
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
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        // Custom brand colors - BoostUp Palette
        olive: {
          DEFAULT: "hsl(var(--olive))",
          dark: "hsl(var(--olive-dark))",
          light: "hsl(var(--olive-light))",
        },
        cream: {
          DEFAULT: "hsl(var(--cream))",
          dark: "hsl(var(--cream-dark))",
        },
        lime: {
          DEFAULT: "hsl(var(--lime))",
          dark: "hsl(var(--lime-dark))",
        },
        terracotta: {
          DEFAULT: "hsl(var(--terracotta))",
          dark: "hsl(var(--terracotta-dark))",
        },
        orange: {
          DEFAULT: "hsl(var(--orange))",
          dark: "hsl(var(--orange-dark))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.6", transform: "scale(1.1)" },
        },
        "flavor-in": {
          from: { opacity: "0", transform: "rotateY(-70deg) scale(0.96)" },
          to: { opacity: "1", transform: "rotateY(0deg) scale(1)" },
        },
        "flavor-out": {
          from: { opacity: "1", transform: "rotateY(0deg) scale(1)" },
          to: { opacity: "0", transform: "rotateY(70deg) scale(0.96)" },
        },
        "energy-pulse": {
          "0%": { boxShadow: "0 0 0 0 rgba(190, 242, 100, 0.4)" },
          "70%": { boxShadow: "0 0 0 15px rgba(190, 242, 100, 0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(190, 242, 100, 0)" },
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
        "energy-pulse": "energy-pulse 2s infinite",
        "flavor-in": "flavor-in 0.65s cubic-bezier(0.22, 1, 0.36, 1) both",
        "flavor-out": "flavor-out 0.65s cubic-bezier(0.22, 1, 0.36, 1) both",
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
