rules: {
  "@typescript-eslint/no-explicit-any": "off",
  "@typescript-eslint/no-unused-vars": "warn",
  "@typescript-eslint/ban-ts-comment": "off",
  "@typescript-eslint/no-require-imports": "off",
  "no-case-declarations": "warn",
  "no-console": "off",
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
}
