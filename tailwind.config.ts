import type {Config} from "tailwindcss";

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
      colors: {
        "main-black": "#211a1e",
        "main-green": "#86b69b",
        "light-green": "#adcebc",
        "dark-green": "#72aa8b",
        "main-pink": "#eeb8a5",
        "dark-pink": "#e6977a77",
        "main-yellow": "#e7eea5",
        "main-white": "#e2e0dd",
        "shadow-white": "#4d4942",
        "shadow-white-trans": "#4d494288",
      },
    },
  },
  plugins: [],
};
export default config;
