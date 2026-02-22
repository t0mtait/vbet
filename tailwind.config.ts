import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      animation: {
        glow: 'glow 2s ease-in-out infinite',
        sizePulse: 'sizePulse 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
export default config;
