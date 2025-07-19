#!/bin/bash

echo "📄 Создаём .eslintrc.js..."

cat > .eslintrc.js << 'EOCONFIG'
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  extends: [
    'next',
    'plugin:@typescript-eslint/recommended',
    'eslint:recommended'
  ],
  plugins: ['@typescript-eslint'],
  rules: {
    '@typescript-eslint/no-unused-vars': [
      'warn',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
    ],
    '@typescript-eslint/no-explicit-any': 'warn'
  }
}
EOCONFIG

echo "✅ Конфигурация ESLint создана."

echo "🚀 Запускаем pnpm build..."
pnpm build
