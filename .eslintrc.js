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
  plugins: ["@typescript-eslint", "react", "react-hooks", "unused-imports"],
  extends: [
    "next",
    "next/core-web-vitals",
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react-hooks/recommended",
    "plugin:prettier/recommended"
  ],
  rules: {
    // отключаем ошибки по any
    "@typescript-eslint/no-explicit-any": "off",
    // предупреждение вместо ошибки
    "@typescript-eslint/no-unused-vars": "warn",
    "no-case-declarations": "warn",
    "no-console": "off",
    "@typescript-eslint/ban-ts-comment": "off",

    // неиспользуемые импорты — удалить
    "unused-imports/no-unused-imports": "warn",
    "unused-imports/no-unused-vars": [
      "warn",
      {
        vars: "all",
        varsIgnorePattern: "^_",
        args: "after-used",
        argsIgnorePattern: "^_"
      }
    ]
  },
  settings: {
    react: {
      version: "detect"
    }
  }
}
