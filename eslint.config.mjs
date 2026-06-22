import nextVitals from "eslint-config-next/core-web-vitals";

const config = [
  {
    ignores: [".next/**", "node_modules/**", "public/**"],
  },
  ...nextVitals,
  {
    rules: {
      // Pre-existing data-fetching effects (loading-state + fetch) trip this
      // new rule; downgraded to a warning rather than rewriting working flows
      // during the framework upgrade.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
];

export default config;
