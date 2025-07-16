// Exchange configuration and API integration utilities

export interface ExchangeConfig {
  id: string
  name: string
  baseUrl: string
  testnetUrl?: string
  apiVersion: string
  rateLimit: {
    requests: number
    window: number // seconds
    burst?: number
  }
  authentication: {
    type: 'hmac' | 'rsa' | 'oauth'
    headers: string[]
    requiresPassphrase: boolean
  }
  features: {
    spot: boolean
    futures: boolean
    margin: boolean
    options: boolean
    staking: boolean
    lending: boolean
    nft: boolean
    p2p: boolean
    fiat: boolean
  }
  orderTypes: string[]
  timeInForce: string[]
  regions: string[]
  fees: {
    maker: number
    taker: number
    withdrawal: 'variable' | 'fixed'
  }
}

export const exchangeConfigs: Record<string, ExchangeConfig> = {
  binance: {
    id: 'binance',
    name: 'Binance',
    baseUrl: 'https://api.binance.com',
    testnetUrl: 'https://testnet.binance.vision',
    apiVersion: 'v3',
    rateLimit: { requests: 1200, window: 60, burst: 10 },
    authentication: {
      type: 'hmac',
      headers: ['X-MBX-APIKEY', 'signature', 'timestamp'],
      requiresPassphrase: false,
    },
    features: {
      spot: true,
      futures: true,
      margin: true,
      options: false,
      staking: true,
      lending: true,
      nft: true,
      p2p: true,
      fiat: true,
    },
    orderTypes: [
      'MARKET',
      'LIMIT',
      'STOP_LOSS',
      'STOP_LOSS_LIMIT',
      'TAKE_PROFIT',
      'TAKE_PROFIT_LIMIT',
      'LIMIT_MAKER',
    ],
    timeInForce: ['GTC', 'IOC', 'FOK'],
    regions: ['Global', 'Except US'],
    fees: { maker: 0.001, taker: 0.001, withdrawal: 'variable' },
  },
  coinbase: {
    id: 'coinbase',
    name: 'Coinbase Pro',
    baseUrl: 'https://api.exchange.coinbase.com',
    testnetUrl: 'https://api-public.sandbox.exchange.coinbase.com',
    apiVersion: 'v1',
    rateLimit: { requests: 10000, window: 3600 },
    authentication: {
      type: 'hmac',
      headers: ['CB-ACCESS-KEY', 'CB-ACCESS-SIGN', 'CB-ACCESS-TIMESTAMP', 'CB-ACCESS-PASSPHRASE'],
      requiresPassphrase: true,
    },
    features: {
      spot: true,
      futures: false,
      margin: false,
      options: false,
      staking: true,
      lending: false,
      nft: true,
      p2p: false,
      fiat: true,
    },
    orderTypes: ['market', 'limit', 'stop'],
    timeInForce: ['GTC', 'GTT', 'IOC', 'FOK'],
    regions: ['US', 'EU', 'UK', 'Canada'],
    fees: { maker: 0.005, taker: 0.005, withdrawal: 'variable' },
  },
  bybit: {
    id: 'bybit',
    name: 'Bybit',
    baseUrl: 'https://api.bybit.com',
    testnetUrl: 'https://api-testnet.bybit.com',
    apiVersion: 'v5',
    rateLimit: { requests: 120, window: 60 },
    authentication: {
      type: 'hmac',
      headers: ['X-BAPI-API-KEY', 'X-BAPI-SIGN', 'X-BAPI-TIMESTAMP'],
      requiresPassphrase: false,
    },
    features: {
      spot: true,
      futures: true,
      margin: true,
      options: true,
      staking: true,
      lending: true,
      nft: false,
      p2p: true,
      fiat: true,
    },
    orderTypes: ['Market', 'Limit', 'Stop', 'StopLimit', 'PostOnly'],
    timeInForce: ['GTC', 'IOC', 'FOK'],
    regions: ['Global', 'Except US'],
    fees: { maker: 0.001, taker: 0.001, withdrawal: 'variable' },
  },
  // Add more exchange configurations...
}

export function getExchangeConfig(exchangeId: string): ExchangeConfig | null {
  return exchangeConfigs[exchangeId] || null
}

export function validateAPICredentials(exchangeId: string, credentials: any): boolean {
  const config = getExchangeConfig(exchangeId)
  if (!config) return false

  const requiredFields = ['apiKey', 'secretKey']
  if (config.authentication.requiresPassphrase) {
    requiredFields.push('passphrase')
  }

  return requiredFields.every((field) => credentials[field] && credentials[field].length > 0)
}

export function buildAuthHeaders(
  exchangeId: string,
  credentials: any,
  method: string,
  path: string,
  body?: string
): Record<string, string> {
  const config = getExchangeConfig(exchangeId)
  if (!config) throw new Error(`Unknown exchange: ${exchangeId}`)

  const timestamp = Date.now().toString()
  const headers: Record<string, string> = {}

  switch (exchangeId) {
    case 'binance':
      const binanceSignature = createHMACSignature(
        credentials.secretKey,
        `timestamp=${timestamp}${body || ''}`
      )
      headers['X-MBX-APIKEY'] = credentials.apiKey
      headers['signature'] = binanceSignature
      headers['timestamp'] = timestamp
      break

    case 'coinbase':
      const cbMessage = timestamp + method.toUpperCase() + path + (body || '')
      const cbSignature = createHMACSignature(credentials.secretKey, cbMessage, 'base64')
      headers['CB-ACCESS-KEY'] = credentials.apiKey
      headers['CB-ACCESS-SIGN'] = cbSignature
      headers['CB-ACCESS-TIMESTAMP'] = timestamp
      headers['CB-ACCESS-PASSPHRASE'] = credentials.passphrase
      break

    case 'bybit':
      const bybitParams = body || ''
      const bybitMessage = timestamp + credentials.apiKey + '5000' + bybitParams
      const bybitSignature = createHMACSignature(credentials.secretKey, bybitMessage)
      headers['X-BAPI-API-KEY'] = credentials.apiKey
      headers['X-BAPI-SIGN'] = bybitSignature
      headers['X-BAPI-TIMESTAMP'] = timestamp
      headers['X-BAPI-RECV-WINDOW'] = '5000'
      break
  }

  return headers
}

function createHMACSignature(
  secret: string,
  message: string,
  encoding: 'hex' | 'base64' = 'hex'
): string {
  // In a real implementation, you would use crypto.createHmac
  // This is a placeholder for the browser environment
  return `${secret}_${message}_${encoding}`
}
