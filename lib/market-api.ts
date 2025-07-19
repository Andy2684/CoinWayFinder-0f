export async function fetchMarketData(endpoint: string, params: Record<string, unknown>) {
  const query = new URLSearchParams(params as Record<string, string>).toString()
  const response = await fetch(`${endpoint}?${query}`)
  if (!response.ok) {
    throw new Error('Failed to fetch market data')
  }
  return await response.json()
}
