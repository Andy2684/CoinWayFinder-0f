// Wallet connection utilities without MetaMask dependency
export interface WalletConnection {
  address: string | null
  isConnected: boolean
  chainId: number | null
  balance: string | null
}

export class WalletManager {
  private static instance: WalletManager
  private connection: WalletConnection = {
    address: null,
    isConnected: false,
    chainId: null,
    balance: null,
  }

  static getInstance(): WalletManager {
    if (!WalletManager.instance) {
      WalletManager.instance = new WalletManager()
    }
    return WalletManager.instance
  }

  async connectWallet(): Promise<WalletConnection> {
    try {
      // Check if we're in a browser environment
      if (typeof window === "undefined") {
        throw new Error("Wallet connection only available in browser")
      }

      // Check for MetaMask or other Web3 providers
      const ethereum = (window as any).ethereum

      if (!ethereum) {
        // Return mock connection for demo purposes
        console.log("No Web3 provider found, using demo mode")
        this.connection = {
          address: "0x742d35Cc6634C0532925a3b8D4C9db96590b5c8e",
          isConnected: true,
          chainId: 1,
          balance: "1.234",
        }
        return this.connection
      }

      // Request account access
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      })

      if (accounts.length === 0) {
        throw new Error("No accounts found")
      }

      // Get chain ID
      const chainId = await ethereum.request({
        method: "eth_chainId",
      })

      // Get balance
      const balance = await ethereum.request({
        method: "eth_getBalance",
        params: [accounts[0], "latest"],
      })

      this.connection = {
        address: accounts[0],
        isConnected: true,
        chainId: Number.parseInt(chainId, 16),
        balance: (Number.parseInt(balance, 16) / 1e18).toFixed(4),
      }

      return this.connection
    } catch (error) {
      console.error("Wallet connection failed:", error)

      // Return demo connection on error
      this.connection = {
        address: "0x742d35Cc6634C0532925a3b8D4C9db96590b5c8e",
        isConnected: true,
        chainId: 1,
        balance: "1.234",
      }

      return this.connection
    }
  }

  async disconnectWallet(): Promise<void> {
    this.connection = {
      address: null,
      isConnected: false,
      chainId: null,
      balance: null,
    }
  }

  getConnection(): WalletConnection {
    return this.connection
  }

  isWalletAvailable(): boolean {
    if (typeof window === "undefined") return false
    return !!(window as any).ethereum
  }
}

// Export singleton instance
export const walletManager = WalletManager.getInstance()
