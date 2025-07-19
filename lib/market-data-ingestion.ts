export async function fetchMarketData() {
  try {
    // Здесь будет логика загрузки данных
  } catch (error) {
    console.error("Market ingestion error:", error)
  }
}

export const marketDataManager = {
  ingest: async () => {
    console.log('Ingesting market data...')
  },
}
