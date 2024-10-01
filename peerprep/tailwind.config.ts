import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      /*global theme colors*/
      colors: {
        "gray-1": "#1e293b",
        "gray-2": "#334155",
        "gray-3": "#475569",
        highlight: "#f8fafc",
        "text-1": "#f8fafc",
        "text-2": "#e2e8f0",
        "difficulty-easy": "#34d399",
        "difficulty-med": "#f59e0b",
        "difficulty-hard": "#f43f5e",
      },
    },
  },
  plugins: [],
};
export default config;
