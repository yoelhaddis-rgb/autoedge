import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--background) / <alpha-value>)",
        foreground: "rgb(var(--foreground) / <alpha-value>)",
        card: "rgb(var(--card) / <alpha-value>)",
        border: "rgb(var(--border) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        accent: "rgb(var(--accent) / <alpha-value>)",
        success: "rgb(var(--success) / <alpha-value>)",
        warning: "rgb(var(--warning) / <alpha-value>)",
        danger: "rgb(var(--danger) / <alpha-value>)"
      },
      fontFamily: {
        display: ["var(--font-display)", "Bebas Neue", "sans-serif"]
      },
      boxShadow: {
        panel: "0 1px 0 0 rgba(212,160,48,0.06), 0 16px 40px rgba(0,0,0,0.6)",
        glow: "0 0 0 1px rgba(212,160,48,0.3), 0 8px 32px rgba(212,160,48,0.15)",
        "glow-sm": "0 0 0 1px rgba(212,160,48,0.2), 0 4px 16px rgba(212,160,48,0.08)",
        inner: "inset 0 1px 0 rgba(255,255,255,0.04)"
      },
      backgroundImage: {
        grid: "linear-gradient(to right, rgba(212,160,48,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(212,160,48,0.03) 1px, transparent 1px)",
        "amber-glow": "radial-gradient(ellipse at 50% 0%, rgba(212,160,48,0.1), transparent 60%)",
        "card-shine": "linear-gradient(135deg, rgba(255,255,255,0.025) 0%, transparent 60%)"
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out",
        "slide-up": "slideUp 0.35s ease-out"
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" }
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        }
      }
    }
  },
  plugins: []
};

export default config;
