module.exports = {
  root: true,
  extends: [
    "next",
    "next/core-web-vitals",
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module"
  },
  rules: {
    "@typescript-eslint/no-explicit-any": "off", // разрешить any
    "@typescript-eslint/no-unused-vars": "warn", // не ошибка, а предупреждение
    "no-case-declarations": "warn",              // не ошибка, а предупреждение
    "no-console": "off"                          // разрешить console.log
  }
}
