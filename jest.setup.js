"use client"

// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

// Used for __tests__/testing-library.js
// Learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom"
import { jest } from "@jest/globals"

// Mock Next.js router
jest.mock("next/router", () => ({
  useRouter() {
    return {
      route: "/",
      pathname: "/",
      query: {},
      asPath: "/",
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
    }
  },
}))

// Mock Next.js navigation
jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return "/"
  },
}))

// Mock environment variables
process.env.NODE_ENV = "test"
process.env.NEXT_PUBLIC_BASE_URL = "http://localhost:3000"
process.env.JWT_SECRET = "test-jwt-secret"
process.env.NEXTAUTH_SECRET = "test-nextauth-secret"

// Mock fetch globally
global.fetch = jest.fn()

// Mock console methods to reduce noise in tests
const originalError = console.error
const originalWarn = console.warn

const { beforeAll, afterAll, afterEach } = jest

beforeAll(() => {
  console.error = (...args) => {
    if (typeof args[0] === "string" && args[0].includes("Warning: ReactDOM.render is no longer supported")) {
      return
    }
    originalError.call(console, ...args)
  }

  console.warn = (...args) => {
    if (
      typeof args[0] === "string" &&
      (args[0].includes("componentWillReceiveProps") || args[0].includes("componentWillUpdate"))
    ) {
      return
    }
    originalWarn.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
  console.warn = originalWarn
})

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks()

  // Reset fetch mock
  if (global.fetch && typeof global.fetch.mockClear === "function") {
    global.fetch.mockClear()
  }
})

// Global test utilities
global.testUtils = {
  // Mock API response
  mockApiResponse: (data, status = 200) => {
    return Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(data),
      text: () => Promise.resolve(JSON.stringify(data)),
    })
  },

  // Mock API error
  mockApiError: (message = "API Error", status = 500) => {
    return Promise.reject(new Error(message))
  },

  // Wait for async operations
  waitFor: (ms = 0) => new Promise((resolve) => setTimeout(resolve, ms)),

  // Create mock user
  createMockUser: (overrides = {}) => ({
    id: "1",
    email: "test@example.com",
    username: "testuser",
    isActive: true,
    subscription: {
      plan: "free",
      status: "active",
    },
    ...overrides,
  }),

  // Create mock bot
  createMockBot: (overrides = {}) => ({
    id: "1",
    userId: "1",
    name: "Test Bot",
    strategy: "dca",
    status: "stopped",
    config: {
      symbol: "BTCUSDT",
      exchange: "binance",
      amount: 100,
    },
    performance: {
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      totalProfit: 0,
      totalLoss: 0,
      winRate: 0,
      maxDrawdown: 0,
    },
    ...overrides,
  }),
}

// Setup test database (if needed)
beforeAll(async () => {
  // Initialize test database connection if needed
  // This would be where you set up a test database
})

afterAll(async () => {
  // Clean up test database if needed
  // This would be where you tear down the test database
})
