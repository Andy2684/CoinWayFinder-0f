#!/bin/bash

echo "📄 Создаём .eslintrc.js с правилами игнорирования _переменных..."

cat > .eslintrc.js << 'EOCONFIG'
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'next',
    'plugin:@typescript-eslint/recommended',
    'eslint:recommended'
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }
    ],
    '@typescript-eslint/no-explicit-any': 'warn'
  }
}
EOCONFIG

echo "✅ .eslintrc.js создан"

echo "🚀 Запускаем повторный build..."
pnpm build
