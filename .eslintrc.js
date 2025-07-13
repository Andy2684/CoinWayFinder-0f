module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: {
      jsx: true
    }
  },
  plugins: ["@typescript-eslint", "react", "react-hooks"],
  extends: [
    "next",
    "next/core-web-vitals",
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:prettier/recommended"
  ],
  rules: {
    // отключаем любые ошибки за неиспользуемые переменные
    "@typescript-eslint/no-unused-vars": "off",
    "no-unused-vars": "off",

    // отключаем авто-ошибки unused-imports (если ты ставил этот плагин ранее)
    "unused-imports/no-unused-vars": "off",
    "unused-imports/no-unused-imports": "off",

    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/ban-ts-comment": "off",
    "@typescript-eslint/no-require-imports": "off",
    "no-case-declarations": "warn",
    "no-console": "off"
  },
  settings: {
    react: {
      version: "detect"
    }
  }
}
