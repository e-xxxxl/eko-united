import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#0A244D", // Lagos Navy — primary
          light: "#123568",
          dark: "#071A38",
        },
        cyan: {
          DEFAULT: "#65CBE9", // Ocean Cyan — secondary
          dark: "#3FB3D6",
        },
        yellow: {
          DEFAULT: "#FFC72C", // Danfo Yellow — added accent, not in the original brand guide
          dark: "#E6AF1A",
        },
        // Crest White — accent — just use Tailwind's built-in `white`
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
