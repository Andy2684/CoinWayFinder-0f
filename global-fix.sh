#!/bin/bash

echo "🌐 Запускаем глобальную очистку синтаксических ошибок..."

shopt -s globstar nullglob

# ✅ Исправить { : 123, → { price: 123,
for file in **/*.ts*; do
  sed -i 's/{ : 50000,/{ price: 50000,/' "$file"
done

# ✅ Исправить все функции вида (: тип) → (arg: тип)
for file in **/*.ts*; do
  sed -i 's/(: string)/(arg: string)/g' "$file"
  sed -i 's/(: number)/(arg: number)/g' "$file"
  sed -i 's/(: boolean)/(arg: boolean)/g' "$file"
  sed -i 's/(: unknown)/(arg: unknown)/g' "$file"
done

echo "✅ Глобальная очистка завершена. Теперь запускай pnpm build"
