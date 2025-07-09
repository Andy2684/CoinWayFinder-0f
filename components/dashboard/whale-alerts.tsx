"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FishIcon as Whale, ExternalLink, Clock } from "lucide-react"
import type { WhaleTransaction } from "@/lib/crypto-api"

export function WhaleAlerts() {
  const [whaleTransactions, setWhaleTransactions] = useState<WhaleTransaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWhaleAlerts()
    const interval = setInterval(fetchWhaleAlerts, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [])

  const fetchWhaleAlerts = async () => {
    try {
      const response = await fetch("/api/crypto/whales")
      const data = await response.json()

      if (data.success) {
        setWhaleTransactions(data.data)
      }
    } catch (error) {
      console.error("Error fetching whale alerts:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatAmount = (amount: number, symbol: string) => {
    return `${amount.toLocaleString()} ${symbol}`
  }

  const formatUSD = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(amount)
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const getTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Whale className="h-5 w-5" />
            Whale Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="p-4 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Whale className="h-5 w-5" />
          Whale Alerts
          <Badge variant="secondary" className="ml-auto">
            Live
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {whaleTransactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Whale className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No whale transactions detected</p>
              <p className="text-sm">Large transactions will appear here</p>
            </div>
          ) : (
            whaleTransactions.map((transaction) => (
              <div key={transaction.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {transaction.blockchain}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {transaction.symbol}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {getTimeAgo(transaction.timestamp)}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="font-semibold text-lg">{formatUSD(transaction.amount_usd)}</div>
                  <div className="text-sm text-muted-foreground">
                    {formatAmount(transaction.amount, transaction.symbol)}
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                    <div>
                      From: <code className="bg-muted px-1 rounded">{formatAddress(transaction.from)}</code>
                    </div>
                    <div>
                      To: <code className="bg-muted px-1 rounded">{formatAddress(transaction.to)}</code>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <Badge
                      variant={transaction.transaction_type === "transfer" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {transaction.transaction_type}
                    </Badge>
                    <button className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700">
                      <ExternalLink className="h-3 w-3" />
                      View Transaction
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
