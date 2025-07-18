"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Wallet, ExternalLink, Copy, CheckCircle } from "lucide-react"
import { walletManager, type WalletConnection } from "@/lib/wallet-connection"
import { useToast } from "@/hooks/use-toast"

export function WalletConnectButton() {
  const [connection, setConnection] = useState<WalletConnection>({
    address: null,
    isConnected: false,
    chainId: null,
    balance: null,
  })
  const [isConnecting, setIsConnecting] = useState(false)
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Check for existing connection on mount
    const existingConnection = walletManager.getConnection()
    if (existingConnection.isConnected) {
      setConnection(existingConnection)
    }
  }, [])

  const handleConnect = async () => {
    setIsConnecting(true)
    try {
      const newConnection = await walletManager.connectWallet()
      setConnection(newConnection)

      toast({
        title: "Wallet Connected",
        description: `Connected to ${newConnection.address?.slice(0, 6)}...${newConnection.address?.slice(-4)}`,
      })
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Could not connect to wallet. Using demo mode.",
        variant: "destructive",
      })
    } finally {
      setIsConnecting(false)
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
      description: "Your wallet has been disconnected.",
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
      default:
        return "Unknown"
    }
  }

  if (!connection.isConnected) {
    return (
      <Button
        onClick={handleConnect}
        disabled={isConnecting}
        className="bg-emerald-600 hover:bg-emerald-700 transition-all duration-300 hover:scale-105"
      >
        <Wallet className="w-4 h-4 mr-2" />
        {isConnecting ? "Connecting..." : "Connect Wallet"}
      </Button>
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
