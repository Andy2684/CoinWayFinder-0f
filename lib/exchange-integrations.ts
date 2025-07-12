// Enhanced exchange integration utilities with real API support

import crypto from "crypto";

export interface ExchangeCredentials {
  apiKey: string;
  secretKey: string;
  passphrase?: string;
  testnet?: boolean;
}

export interface ExchangeConfig {
  id: string;
  name: string;
  baseUrl: string;
  testnetUrl?: string;
  wsUrl: string;
  testnetWsUrl?: string;
  rateLimit: {
    requests: number;
    window: number; // seconds
  };
  authentication: {
    type: "hmac" | "rsa";
    requiresPassphrase: boolean;
  };
  endpoints: {
    account: string;
    balance: string;
    orders: string;
    trades: string;
    ticker: string;
    orderbook: string;
    klines: string;
  };
}

export const EXCHANGE_CONFIGS: Record<string, ExchangeConfig> = {
  binance: {
    id: "binance",
    name: "Binance",
    baseUrl: "https://api.binance.com",
    testnetUrl: "https://testnet.binance.vision",
    wsUrl: "wss://stream.binance.com:9443/ws",
    testnetWsUrl: "wss://testnet.binance.vision/ws",
    rateLimit: { requests: 1200, window: 60 },
    authentication: { type: "hmac", requiresPassphrase: false },
    endpoints: {
      account: "/api/v3/account",
      balance: "/api/v3/account",
      orders: "/api/v3/order",
      trades: "/api/v3/myTrades",
      ticker: "/api/v3/ticker/24hr",
      orderbook: "/api/v3/depth",
      klines: "/api/v3/klines",
    },
  },
  bybit: {
    id: "bybit",
    name: "Bybit",
    baseUrl: "https://api.bybit.com",
    testnetUrl: "https://api-testnet.bybit.com",
    wsUrl: "wss://stream.bybit.com/v5/public/spot",
    testnetWsUrl: "wss://stream-testnet.bybit.com/v5/public/spot",
    rateLimit: { requests: 120, window: 60 },
    authentication: { type: "hmac", requiresPassphrase: false },
    endpoints: {
      account: "/v5/account/wallet-balance",
      balance: "/v5/account/wallet-balance",
      orders: "/v5/order/create",
      trades: "/v5/execution/list",
      ticker: "/v5/market/tickers",
      orderbook: "/v5/market/orderbook",
      klines: "/v5/market/kline",
    },
  },
  kucoin: {
    id: "kucoin",
    name: "KuCoin",
    baseUrl: "https://api.kucoin.com",
    testnetUrl: "https://openapi-sandbox.kucoin.com",
    wsUrl: "wss://ws-api.kucoin.com/endpoint",
    testnetWsUrl: "wss://ws-api-sandbox.kucoin.com/endpoint",
    rateLimit: { requests: 1800, window: 60 },
    authentication: { type: "hmac", requiresPassphrase: true },
    endpoints: {
      account: "/api/v1/accounts",
      balance: "/api/v1/accounts",
      orders: "/api/v1/orders",
      trades: "/api/v1/fills",
      ticker: "/api/v1/market/stats",
      orderbook: "/api/v1/market/orderbook/level2_20",
      klines: "/api/v1/market/candles",
    },
  },
  okx: {
    id: "okx",
    name: "OKX",
    baseUrl: "https://www.okx.com",
    testnetUrl: "https://www.okx.com",
    wsUrl: "wss://ws.okx.com:8443/ws/v5/public",
    testnetWsUrl: "wss://wspap.okx.com:8443/ws/v5/public?brokerId=9999",
    rateLimit: { requests: 20, window: 2 },
    authentication: { type: "hmac", requiresPassphrase: true },
    endpoints: {
      account: "/api/v5/account/balance",
      balance: "/api/v5/account/balance",
      orders: "/api/v5/trade/order",
      trades: "/api/v5/trade/fills",
      ticker: "/api/v5/market/ticker",
      orderbook: "/api/v5/market/books",
      klines: "/api/v5/market/candles",
    },
  },
  coinbase: {
    id: "coinbase",
    name: "Coinbase Pro",
    baseUrl: "https://api.exchange.coinbase.com",
    testnetUrl: "https://api-public.sandbox.exchange.coinbase.com",
    wsUrl: "wss://ws-feed.exchange.coinbase.com",
    testnetWsUrl: "wss://ws-feed-public.sandbox.exchange.coinbase.com",
    rateLimit: { requests: 10000, window: 3600 },
    authentication: { type: "hmac", requiresPassphrase: true },
    endpoints: {
      account: "/accounts",
      balance: "/accounts",
      orders: "/orders",
      trades: "/fills",
      ticker: "/products/stats",
      orderbook: "/products/{symbol}/book",
      klines: "/products/{symbol}/candles",
    },
  },
};

export class ExchangeAPI {
  private config: ExchangeConfig;
  private credentials: ExchangeCredentials;
  private baseUrl: string;

  constructor(exchangeId: string, credentials: ExchangeCredentials) {
    const config = EXCHANGE_CONFIGS[exchangeId];
    if (!config) {
      throw new Error(`Unsupported exchange: ${exchangeId}`);
    }

    this.config = config;
    this.credentials = credentials;
    this.baseUrl =
      credentials.testnet && config.testnetUrl
        ? config.testnetUrl
        : config.baseUrl;
  }

  private createSignature(
    method: string,
    path: string,
    body = "",
    timestamp: string,
  ): string {
    const { secretKey } = this.credentials;

    switch (this.config.id) {
      case "binance":
        return crypto
          .createHmac("sha256", secretKey)
          .update(body)
          .digest("hex");

      case "bybit":
        const bybitMessage =
          timestamp + this.credentials.apiKey + "5000" + body;
        return crypto
          .createHmac("sha256", secretKey)
          .update(bybitMessage)
          .digest("hex");

      case "kucoin":
        const kucoinMessage = timestamp + method + path + body;
        return crypto
          .createHmac("sha256", secretKey)
          .update(kucoinMessage)
          .digest("base64");

      case "okx":
        const okxMessage = timestamp + method + path + body;
        return crypto
          .createHmac("sha256", secretKey)
          .update(okxMessage)
          .digest("base64");

      case "coinbase":
        const cbMessage = timestamp + method + path + body;
        return crypto
          .createHmac("sha256", Buffer.from(secretKey, "base64"))
          .update(cbMessage)
          .digest("base64");

      default:
        throw new Error(
          `Signature method not implemented for ${this.config.id}`,
        );
    }
  }

  private buildHeaders(
    method: string,
    path: string,
    body = "",
  ): Record<string, string> {
    const timestamp = Date.now().toString();
    const signature = this.createSignature(method, path, body, timestamp);
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    switch (this.config.id) {
      case "binance":
        headers["X-MBX-APIKEY"] = this.credentials.apiKey;
        break;

      case "bybit":
        headers["X-BAPI-API-KEY"] = this.credentials.apiKey;
        headers["X-BAPI-TIMESTAMP"] = timestamp;
        headers["X-BAPI-SIGN"] = signature;
        headers["X-BAPI-RECV-WINDOW"] = "5000";
        break;

      case "kucoin":
        headers["KC-API-KEY"] = this.credentials.apiKey;
        headers["KC-API-TIMESTAMP"] = timestamp;
        headers["KC-API-SIGN"] = signature;
        headers["KC-API-PASSPHRASE"] = this.credentials.passphrase || "";
        headers["KC-API-KEY-VERSION"] = "2";
        break;

      case "okx":
        headers["OK-ACCESS-KEY"] = this.credentials.apiKey;
        headers["OK-ACCESS-TIMESTAMP"] = timestamp;
        headers["OK-ACCESS-SIGN"] = signature;
        headers["OK-ACCESS-PASSPHRASE"] = this.credentials.passphrase || "";
        break;

      case "coinbase":
        headers["CB-ACCESS-KEY"] = this.credentials.apiKey;
        headers["CB-ACCESS-TIMESTAMP"] = timestamp;
        headers["CB-ACCESS-SIGN"] = signature;
        headers["CB-ACCESS-PASSPHRASE"] = this.credentials.passphrase || "";
        break;
    }

    return headers;
  }

  async makeRequest(
    method: string,
    endpoint: string,
    params: any = {},
  ): Promise<any> {
    const path = endpoint;
    const body = method === "GET" ? "" : JSON.stringify(params);
    const url = `${this.baseUrl}${path}${method === "GET" && Object.keys(params).length ? "?" + new URLSearchParams(params).toString() : ""}`;

    const headers = this.buildHeaders(method, path, body);

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: method === "GET" ? undefined : body,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`${this.config.name} API Error:`, error);
      throw error;
    }
  }

  // Account Methods
  async getAccount(): Promise<any> {
    return this.makeRequest("GET", this.config.endpoints.account);
  }

  async getBalance(): Promise<any> {
    return this.makeRequest("GET", this.config.endpoints.balance);
  }

  // Trading Methods
  async placeOrder(params: {
    symbol: string;
    side: "buy" | "sell";
    type: "market" | "limit";
    quantity: number;
    price?: number;
  }): Promise<any> {
    const orderParams = this.formatOrderParams(params);
    return this.makeRequest("POST", this.config.endpoints.orders, orderParams);
  }

  async cancelOrder(orderId: string, symbol?: string): Promise<any> {
    const params = { orderId, ...(symbol && { symbol }) };
    return this.makeRequest("DELETE", this.config.endpoints.orders, params);
  }

  async getOpenOrders(symbol?: string): Promise<any> {
    const params = symbol ? { symbol } : {};
    return this.makeRequest("GET", this.config.endpoints.orders, params);
  }

  async getTradeHistory(symbol?: string): Promise<any> {
    const params = symbol ? { symbol } : {};
    return this.makeRequest("GET", this.config.endpoints.trades, params);
  }

  // Market Data Methods
  async getTicker(symbol?: string): Promise<any> {
    const params = symbol ? { symbol } : {};
    return this.makeRequest("GET", this.config.endpoints.ticker, params);
  }

  async getOrderBook(symbol: string, limit = 100): Promise<any> {
    const params = { symbol, limit };
    return this.makeRequest("GET", this.config.endpoints.orderbook, params);
  }

  async getKlines(symbol: string, interval: string, limit = 500): Promise<any> {
    const params = { symbol, interval, limit };
    return this.makeRequest("GET", this.config.endpoints.klines, params);
  }

  private formatOrderParams(params: any): any {
    // Format order parameters based on exchange requirements
    switch (this.config.id) {
      case "binance":
        return {
          symbol: params.symbol,
          side: params.side.toUpperCase(),
          type: params.type.toUpperCase(),
          quantity: params.quantity.toString(),
          ...(params.price && { price: params.price.toString() }),
          timestamp: Date.now(),
        };

      case "bybit":
        return {
          category: "spot",
          symbol: params.symbol,
          side: params.side.charAt(0).toUpperCase() + params.side.slice(1),
          orderType: params.type.charAt(0).toUpperCase() + params.type.slice(1),
          qty: params.quantity.toString(),
          ...(params.price && { price: params.price.toString() }),
        };

      case "kucoin":
        return {
          clientOid: crypto.randomUUID(),
          symbol: params.symbol,
          side: params.side,
          type: params.type,
          size: params.quantity.toString(),
          ...(params.price && { price: params.price.toString() }),
        };

      case "okx":
        return {
          instId: params.symbol,
          tdMode: "cash",
          side: params.side,
          ordType: params.type,
          sz: params.quantity.toString(),
          ...(params.price && { px: params.price.toString() }),
        };

      case "coinbase":
        return {
          product_id: params.symbol,
          side: params.side,
          type: params.type,
          size: params.quantity.toString(),
          ...(params.price && { price: params.price.toString() }),
        };

      default:
        return params;
    }
  }

  // WebSocket Connection
  createWebSocket(channels: string[]): WebSocket {
    const wsUrl =
      this.credentials.testnet && this.config.testnetWsUrl
        ? this.config.testnetWsUrl
        : this.config.wsUrl;

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log(`Connected to ${this.config.name} WebSocket`);

      // Subscribe to channels based on exchange format
      const subscribeMessage = this.formatWebSocketSubscription(channels);
      ws.send(JSON.stringify(subscribeMessage));
    };

    ws.onerror = (error) => {
      console.error(`${this.config.name} WebSocket Error:`, error);
    };

    return ws;
  }

  private formatWebSocketSubscription(channels: string[]): any {
    switch (this.config.id) {
      case "binance":
        return {
          method: "SUBSCRIBE",
          params: channels,
          id: 1,
        };

      case "bybit":
        return {
          op: "subscribe",
          args: channels,
        };

      case "kucoin":
        return {
          type: "subscribe",
          topic: channels[0],
          response: true,
        };

      case "okx":
        return {
          op: "subscribe",
          args: channels.map((channel) => ({ channel })),
        };

      case "coinbase":
        return {
          type: "subscribe",
          channels: channels,
        };

      default:
        return { channels };
    }
  }
}

// Exchange Factory
export class ExchangeFactory {
  static create(
    exchangeId: string,
    credentials: ExchangeCredentials,
  ): ExchangeAPI {
    return new ExchangeAPI(exchangeId, credentials);
  }

  static getSupportedExchanges(): string[] {
    return Object.keys(EXCHANGE_CONFIGS);
  }

  static getExchangeConfig(exchangeId: string): ExchangeConfig | null {
    return EXCHANGE_CONFIGS[exchangeId] || null;
  }
}

// Portfolio Aggregator
export class PortfolioAggregator {
  private exchanges: Map<string, ExchangeAPI> = new Map();

  addExchange(exchangeId: string, credentials: ExchangeCredentials): void {
    const api = ExchangeFactory.create(exchangeId, credentials);
    this.exchanges.set(exchangeId, api);
  }

  async getAggregatedBalance(): Promise<any> {
    const balances = new Map();

    for (const [exchangeId, api] of this.exchanges) {
      try {
        const balance = await api.getBalance();
        const normalizedBalance = this.normalizeBalance(exchangeId, balance);

        for (const [asset, amount] of Object.entries(normalizedBalance)) {
          const current = balances.get(asset) || 0;
          balances.set(asset, current + (amount as number));
        }
      } catch (error) {
        console.error(`Failed to get balance from ${exchangeId}:`, error);
      }
    }

    return Object.fromEntries(balances);
  }

  private normalizeBalance(
    exchangeId: string,
    balance: any,
  ): Record<string, number> {
    // Normalize balance format across different exchanges
    const normalized: Record<string, number> = {};

    switch (exchangeId) {
      case "binance":
        if (balance.balances) {
          balance.balances.forEach((b: any) => {
            const free = Number.parseFloat(b.free);
            const locked = Number.parseFloat(b.locked);
            if (free + locked > 0) {
              normalized[b.asset] = free + locked;
            }
          });
        }
        break;

      case "bybit":
        if (balance.result?.list) {
          balance.result.list.forEach((account: any) => {
            if (account.coin) {
              account.coin.forEach((c: any) => {
                const total = Number.parseFloat(c.walletBalance);
                if (total > 0) {
                  normalized[c.coin] = total;
                }
              });
            }
          });
        }
        break;

      // Add more exchange-specific balance normalization
      default:
        return balance;
    }

    return normalized;
  }
}
