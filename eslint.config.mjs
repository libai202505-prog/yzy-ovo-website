import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

const config = [
  ...nextCoreWebVitals,
  {
    ignores: [".next/**", "node_modules/**", "out/**"]
  },
  {
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "@next/next/no-img-element": "warn",
      "react/no-unescaped-entities": "warn"
    }
  }
];

export default config;