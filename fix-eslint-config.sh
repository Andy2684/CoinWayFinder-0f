#!/bin/bash

# Добавляем игнорирование _переменных
if [ -f .eslintrc.js ]; then
  echo "✅ Обновляем .eslintrc.js"
  sed -i '/rules:/,/}/ s/{/{\n    "@typescript-eslint\/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],/' .eslintrc.js
elif [ -f .eslintrc.json ]; then
  echo "✅ Обновляем .eslintrc.json"
  jq '.rules["@typescript-eslint/no-unused-vars"] = ["warn", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }]' .eslintrc.json > tmp.json && mv tmp.json .eslintrc.json
else
  echo "❌ ESLint config file not found."
  exit 1
fi

echo "🚀 ESLint теперь игнорирует переменные с подчёркиванием"
