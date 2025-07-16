"use client"

import { useState, useEffect } from "react"
import { PortfolioOverview } from "@/components/portfolio/portfolio-overview"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, RefreshCw } from "lucide-react"
import { toast } from "sonner"

interface PortfolioPosition {
  id: string
  symbol: string
  quantity: number
  average_price: number
  current_price: number
  total_value: number
  pnl: number
  pnl_percentage: number
}

export default function PortfolioPage() {
  const [positions, setPositions] = useState<PortfolioPosition[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddingPosition, setIsAddingPosition] = useState(false)
  const [newPosition, setNewPosition] = useState({
    symbol: "",
    quantity: "",
    averagePrice: "",
    currentPrice: "",
  })

  useEffect(() => {
    fetchPortfolio()
  }, [])

  const fetchPortfolio = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        toast.error("Please log in to view your portfolio")
        return
      }

      const response = await fetch("/api/portfolio", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setPositions(data.portfolio || [])
      } else {
        toast.error("Failed to fetch portfolio")
      }
    } catch (error) {
      console.error("Portfolio fetch error:", error)
      toast.error("Failed to fetch portfolio")
    } finally {
      setLoading(false)
    }
  }

  const handleAddPosition = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        toast.error("Please log in to add positions")
        return
      }

      if (!newPosition.symbol || !newPosition.quantity || !newPosition.averagePrice) {
        toast.error("Please fill in all required fields")
        return
      }

      setIsAddingPosition(true)

      const response = await fetch("/api/portfolio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newPosition),
      })

      if (response.ok) {
        toast.success("Position added successfully")
        setNewPosition({ symbol: "", quantity: "", averagePrice: "", currentPrice: "" })
        fetchPortfolio()
      } else {
        toast.error("Failed to add position")
      }
    } catch (error) {
      console.error("Add position error:", error)
      toast.error("Failed to add position")
    } finally {
      setIsAddingPosition(false)
    }
  }

  const calculateTotals = () => {
    const totalValue = positions.reduce((sum, pos) => sum + pos.total_value, 0)
    const totalPnL = positions.reduce((sum, pos) => sum + pos.pnl, 0)
    const totalPnLPercentage = totalValue > 0 ? (totalPnL / (totalValue - totalPnL)) * 100 : 0

    return { totalValue, totalPnL, totalPnLPercentage }
  }

  const { totalValue, totalPnL, totalPnLPercentage } = calculateTotals()

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Portfolio</h1>
          <p className="text-muted-foreground">Track your trading positions and performance</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchPortfolio} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Position
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Position</DialogTitle>
                <DialogDescription>Add a new trading position to your portfolio</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="symbol">Symbol *</Label>
                  <Input
                    id="symbol"
                    placeholder="e.g., BTC/USD"
                    value={newPosition.symbol}
                    onChange={(e) => setNewPosition({ ...newPosition, symbol: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    step="0.00000001"
                    placeholder="0.00000000"
                    value={newPosition.quantity}
                    onChange={(e) => setNewPosition({ ...newPosition, quantity: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="averagePrice">Average Price *</Label>
                  <Input
                    id="averagePrice"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={newPosition.averagePrice}
                    onChange={(e) => setNewPosition({ ...newPosition, averagePrice: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="currentPrice">Current Price (optional)</Label>
                  <Input
                    id="currentPrice"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={newPosition.currentPrice}
                    onChange={(e) => setNewPosition({ ...newPosition, currentPrice: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddPosition} disabled={isAddingPosition}>
                  {isAddingPosition ? "Adding..." : "Add Position"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <PortfolioOverview
        positions={positions}
        totalValue={totalValue}
        totalPnL={totalPnL}
        totalPnLPercentage={totalPnLPercentage}
      />
    </div>
  )
}
