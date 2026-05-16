import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      boxShadow: {
        soft: "0 24px 80px rgba(56, 107, 148, 0.14)"
      },
      colors: {
        skyglass: "#e8f6ff",
        ink: "#233142"
      }
    }
  },
  plugins: []
};

export default config;
