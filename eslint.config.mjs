import nextConfig from "eslint-config-next";

const eslintConfig = [
  {
    ignores: [".netlify/**", "e2e/**"],
  },
  ...nextConfig,
  {
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/preserve-manual-memoization": "warn",
    },
  },
];

export default eslintConfig;
