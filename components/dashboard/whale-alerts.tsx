"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FishIcon as Whale, ExternalLink, RefreshCw, TrendingUp, TrendingDown } from "lucide-react"
import type { WhaleTransaction } from "@/lib/crypto-api"

export function WhaleAlerts() {
  const [transactions, setTransactions] = useState<WhaleTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  const fetchWhaleTransactions = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/crypto/whales?min_value=1000000")
      const data = await response.json()

      if (data.success) {
        setTransactions(data.data)
        setLastUpdate(new Date())
      }
    } catch (error) {
      console.error("Failed to fetch whale transactions:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWhaleTransactions()

    // Auto-refresh every 2 minutes
    const interval = setInterval(fetchWhaleTransactions, 120000)
    return () => clearInterval(interval)
  }, [])

  const formatAmount = (amount: number) => {
    if (amount >= 1e6) return `${(amount / 1e6).toFixed(2)}M`
    if (amount >= 1e3) return `${(amount / 1e3).toFixed(2)}K`
    return amount.toFixed(2)
  }

  const formatUSD = (amount: number) => {
    if (amount >= 1e9) return `$${(amount / 1e9).toFixed(2)}B`
    if (amount >= 1e6) return `$${(amount / 1e6).toFixed(2)}M`
    if (amount >= 1e3) return `$${(amount / 1e3).toFixed(2)}K`
    return `$${amount.toFixed(2)}`
  }

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case "exchange_deposit":
        return "bg-red-500/10 text-red-400 border-red-500/20"
      case "exchange_withdrawal":
        return "bg-green-500/10 text-green-400 border-green-500/20"
      default:
        return "bg-blue-500/10 text-blue-400 border-blue-500/20"
    }
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "exchange_deposit":
        return <TrendingDown className="w-3 h-3" />
      case "exchange_withdrawal":
        return <TrendingUp className="w-3 h-3" />
      default:
        return <ExternalLink className="w-3 h-3" />
    }
  }

  const getTimeAgo = (timestamp: number) => {
    const now = Math.floor(Date.now() / 1000)
    const diff = now - timestamp

    if (diff < 60) return `${diff}s ago`
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
  }

  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center">
            <Whale className="w-5 h-5 mr-2 text-[#30D5C8]" />
            Whale Alerts
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge className="bg-orange-500/10 text-orange-400">
              <Whale className="w-3 h-3 mr-1" />
              Live Tracking
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchWhaleTransactions}
              disabled={loading}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
        <p className="text-sm text-gray-400">
          Large transactions over $1M • Last updated: {lastUpdate.toLocaleTimeString()}
        </p>
      </CardHeader>
      <CardContent>
        {loading && transactions.length === 0 ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
                      <div>
                        <div className="h-4 bg-gray-700 rounded w-16 mb-1"></div>
                        <div className="h-3 bg-gray-700 rounded w-20"></div>
                      </div>
                    </div>
                    <div className="h-6 bg-gray-700 rounded w-24"></div>
                  </div>
                  <div className="h-3 bg-gray-700 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-700 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.slice(0, 10).map((tx) => (
              <div
                key={tx.id}
                className="p-4 bg-gray-800/30 rounded-lg border border-gray-700 hover:border-[#30D5C8]/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-[#30D5C8] to-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-xs">{tx.symbol}</span>
                    </div>
                    <div>
                      <p className="text-white font-semibold">
                        {formatAmount(tx.amount)} {tx.symbol}
                      </p>
                      <p className="text-gray-400 text-sm">{formatUSD(tx.amount_usd)}</p>
                    </div>
                  </div>
                  <Badge className={getTransactionTypeColor(tx.transaction_type)}>
                    {getTransactionIcon(tx.transaction_type)}
                    <span className="ml-1 capitalize">{tx.transaction_type.replace("_", " ")}</span>
                  </Badge>
                </div>

                <div className="text-sm text-gray-300 mb-2">
                  <p className="truncate">
                    <span className="text-gray-500">From:</span> {tx.from.owner || tx.from.address.slice(0, 10) + "..."}
                  </p>
                  <p className="truncate">
                    <span className="text-gray-500">To:</span> {tx.to.owner || tx.to.address.slice(0, 10) + "..."}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="capitalize">{tx.blockchain}</span>
                  <span>{getTimeAgo(tx.timestamp)}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {transactions.length === 0 && !loading && (
          <div className="text-center py-8">
            <Whale className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-400 mb-2">No whale transactions</h3>
            <p className="text-gray-500">Check back later for large transactions</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
