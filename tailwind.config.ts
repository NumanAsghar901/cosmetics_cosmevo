import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#171312",
        "warm-white": "#FFFDFC",
        cream: "#F8F3EF",
        peach: "#EBC7B7",
        blush: "#F3DDD4",
        plum: {
          DEFAULT: "#791060",
          hover: "#5f0c4d",
          muted: "#A44A87",
        },
        "text-secondary": "#6F6864",
        "border-subtle": "rgba(23, 19, 18, 0.10)",
      },
      fontFamily: {
        manrope: ["var(--font-manrope)", "Manrope", "system-ui", "-apple-system", "sans-serif"],
      },
      maxWidth: {
        maxw: "1360px",
        narrow: "920px",
      },
      boxShadow: {
        soft: "0 16px 40px rgba(23, 19, 18, 0.10)",
      },
      transitionTimingFunction: {
        cosmevo: "cubic-bezier(.22, .61, .36, 1)",
      },
      keyframes: {
        marqueeScroll: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        pulseScale: {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.3)" },
          "100%": { transform: "scale(1)" },
        },
      },
      animation: {
        marquee: "marqueeScroll 30s linear infinite",
        "pulse-scale": "pulseScale 0.4s ease",
      },
    },
  },
  plugins: [],
};

export default config;
