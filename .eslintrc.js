// .eslintrc.js
module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: [
    "@typescript-eslint",
    "react",
    "react-hooks",
    "unused-imports",
    "prettier"
  ],
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
    // отключаем любые ошибки за неиспользуемые переменные и импорты
    "@typescript-eslint/no-unused-vars": "off",
    "no-unused-vars": "off",
    "unused-imports/no-unused-vars": "off",
    "unused-imports/no-unused-imports": "off",

    // отключаем ошибки JSX / any / ts-comment / require
    "react/react-in-jsx-scope": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/ban-ts-comment": "off",
    "@typescript-eslint/no-require-imports": "off",

    // отключаем предупреждение при let/const в switch
    "no-case-declarations": "off",

    // разрешаем console.log
    "no-console": "off",

    // отключаем предупреждение про неэкранированные символы в JSX
    "react/no-unescaped-entities": "off"
  },
  settings: {
    react: {
      version: "detect",
    },
  },
};
