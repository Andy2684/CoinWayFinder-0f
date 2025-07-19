#!/bin/bash

# ✅ Восстановить lib/market-data-ingestion.ts (чистый рабочий код)
cat > ./lib/market-data-ingestion.ts << 'EOF2'
import { fetchMarketData } from "@/lib/market-api"

export async function ingestMarketData() {
  try {
    const data = await fetchMarketData()
    console.log("Market data ingested:", data.length)
  } catch (error) {
    console.error("Market ingestion error:", error)
  }
}
EOF2

# ✅ Восстановить lib/utils.ts (без any и с валидным синтаксисом)
cat > ./lib/utils.ts << 'EOF3'
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function formatPrice(value: number): string {
  return `$${value.toFixed(2)}`
}
EOF3

echo "✅ commands_batch_4.sh завершён. Файлы успешно восстановлены."
