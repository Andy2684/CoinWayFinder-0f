"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Wallet, ExternalLink, Copy, CheckCircle, Smartphone, Monitor, Shield, QrCode } from "lucide-react"
import { walletManager, type WalletConnection } from "@/lib/wallet-connection"
import { useToast } from "@/hooks/use-toast"

const WALLET_OPTIONS = [
  {
    id: "metamask",
    name: "MetaMask",
    description: "Connect using MetaMask browser extension",
    icon: "🦊",
    type: "browser",
    popular: true,
  },
  {
    id: "walletconnect",
    name: "WalletConnect",
    description: "Connect with WalletConnect protocol",
    icon: "🔗",
    type: "mobile",
    popular: true,
  },
  {
    id: "coinbase",
    name: "Coinbase Wallet",
    description: "Connect using Coinbase Wallet",
    icon: "🔵",
    type: "browser",
    popular: true,
  },
  {
    id: "trust",
    name: "Trust Wallet",
    description: "Connect using Trust Wallet mobile app",
    icon: "🛡️",
    type: "mobile",
    popular: false,
  },
  {
    id: "phantom",
    name: "Phantom",
    description: "Connect using Phantom wallet (Solana)",
    icon: "👻",
    type: "browser",
    popular: false,
  },
  {
    id: "ledger",
    name: "Ledger",
    description: "Connect using Ledger hardware wallet",
    icon: "🔐",
    type: "hardware",
    popular: false,
  },
  {
    id: "trezor",
    name: "Trezor",
    description: "Connect using Trezor hardware wallet",
    icon: "🔒",
    type: "hardware",
    popular: false,
  },
  {
    id: "rainbow",
    name: "Rainbow",
    description: "Connect using Rainbow wallet",
    icon: "🌈",
    type: "mobile",
    popular: false,
  },
]

export function WalletConnectButton() {
  const [connection, setConnection] = useState<WalletConnection>({
    address: null,
    isConnected: false,
    chainId: null,
    balance: null,
  })
  const [isConnecting, setIsConnecting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    // Check for existing connection on mount
    const existingConnection = walletManager.getConnection()
    if (existingConnection.isConnected) {
      setConnection(existingConnection)
    }
  }, [])

  const handleConnect = async (walletId: string) => {
    setIsConnecting(true)
    setSelectedWallet(walletId)

    try {
      const wallet = WALLET_OPTIONS.find((w) => w.id === walletId)

      // Simulate different connection flows
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const newConnection = await walletManager.connectWallet()
      setConnection(newConnection)
      setShowDialog(false)

      toast({
        title: `${wallet?.name} Connected`,
        description: `Successfully connected to ${newConnection.address?.slice(0, 6)}...${newConnection.address?.slice(-4)}`,
      })
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: `Could not connect to ${WALLET_OPTIONS.find((w) => w.id === walletId)?.name}. Using demo mode.`,
        variant: "destructive",
      })
    } finally {
      setIsConnecting(false)
      setSelectedWallet(null)
    }
  }

  const handleDisconnect = async () => {
    await walletManager.disconnectWallet()
    setConnection({
      address: null,
      isConnected: false,
      chainId: null,
      balance: null,
    })

    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected successfully.",
    })
  }

  const copyAddress = async () => {
    if (connection.address) {
      await navigator.clipboard.writeText(connection.address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)

      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard",
      })
    }
  }

  const getChainName = (chainId: number | null) => {
    switch (chainId) {
      case 1:
        return "Ethereum"
      case 56:
        return "BSC"
      case 137:
        return "Polygon"
      case 43114:
        return "Avalanche"
      case 250:
        return "Fantom"
      case 42161:
        return "Arbitrum"
      case 10:
        return "Optimism"
      default:
        return "Unknown"
    }
  }

  if (!connection.isConnected) {
    return (
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogTrigger asChild>
          <Button className="bg-emerald-600 hover:bg-emerald-700 transition-all duration-300 hover:scale-105">
            <Wallet className="w-4 h-4 mr-2" />
            Connect Wallet
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md bg-black/90 backdrop-blur-xl border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center">
              <Wallet className="w-5 h-5 mr-2" />
              Connect Your Wallet
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-gray-400 mb-4">Choose your preferred wallet to connect to CoinWayFinder</div>

            {/* Popular Wallets */}
            <div>
              <h3 className="text-sm font-medium text-white mb-3">Popular Wallets</h3>
              <div className="space-y-2">
                {WALLET_OPTIONS.filter((wallet) => wallet.popular).map((wallet) => (
                  <Button
                    key={wallet.id}
                    variant="outline"
                    className="w-full justify-start bg-white/5 border-white/10 text-white hover:bg-white/10 h-12"
                    onClick={() => handleConnect(wallet.id)}
                    disabled={isConnecting}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{wallet.icon}</span>
                      <div className="text-left">
                        <p className="font-medium">{wallet.name}</p>
                        <p className="text-xs text-gray-400">{wallet.description}</p>
                      </div>
                    </div>
                    {wallet.type === "browser" && <Monitor className="w-4 h-4 ml-auto" />}
                    {wallet.type === "mobile" && <Smartphone className="w-4 h-4 ml-auto" />}
                    {wallet.type === "hardware" && <Shield className="w-4 h-4 ml-auto" />}
                  </Button>
                ))}
              </div>
            </div>

            {/* Other Wallets */}
            <div>
              <h3 className="text-sm font-medium text-white mb-3">Other Wallets</h3>
              <div className="grid grid-cols-2 gap-2">
                {WALLET_OPTIONS.filter((wallet) => !wallet.popular).map((wallet) => (
                  <Button
                    key={wallet.id}
                    variant="outline"
                    className="justify-start bg-white/5 border-white/10 text-white hover:bg-white/10 h-16"
                    onClick={() => handleConnect(wallet.id)}
                    disabled={isConnecting}
                  >
                    <div className="flex flex-col items-center space-y-1">
                      <span className="text-lg">{wallet.icon}</span>
                      <span className="text-xs font-medium">{wallet.name}</span>
                      {wallet.type === "browser" && <Monitor className="w-3 h-3" />}
                      {wallet.type === "mobile" && <Smartphone className="w-3 h-3" />}
                      {wallet.type === "hardware" && <Shield className="w-3 h-3" />}
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {/* Connection Status */}
            {isConnecting && selectedWallet && (
              <div className="flex items-center justify-center space-x-2 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                <span className="text-blue-400 text-sm">
                  Connecting to {WALLET_OPTIONS.find((w) => w.id === selectedWallet)?.name}...
                </span>
              </div>
            )}

            {/* QR Code Option */}
            <div className="border-t border-white/10 pt-4">
              <Button
                variant="outline"
                className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10"
                disabled={isConnecting}
              >
                <QrCode className="w-4 h-4 mr-2" />
                Connect with QR Code
              </Button>
            </div>

            <div className="text-xs text-gray-500 text-center">
              By connecting a wallet, you agree to our Terms of Service and Privacy Policy
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Card className="glass border-emerald-200 dark:border-emerald-800">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center">
              <Wallet className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-medium">Wallet Connected</p>
              <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-200">
                {getChainName(connection.chainId)}
              </Badge>
            </div>
          </div>
          <CheckCircle className="w-5 h-5 text-emerald-500" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Address:</span>
            <div className="flex items-center space-x-1">
              <code className="text-xs bg-muted px-2 py-1 rounded">
                {connection.address?.slice(0, 6)}...{connection.address?.slice(-4)}
              </code>
              <Button variant="ghost" size="sm" onClick={copyAddress} className="h-6 w-6 p-0">
                {copied ? <CheckCircle className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Balance:</span>
            <span className="text-sm font-medium">{connection.balance} ETH</span>
          </div>
        </div>

        <div className="flex space-x-2 mt-4">
          <Button variant="outline" size="sm" onClick={handleDisconnect} className="flex-1 bg-transparent">
            Disconnect
          </Button>
          <Button variant="outline" size="sm" asChild className="flex-1 bg-transparent">
            <a href={`https://etherscan.io/address/${connection.address}`} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-3 h-3 mr-1" />
              View
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
