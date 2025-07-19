"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, Bot, Settings, Home, TrendingUp, Wallet, Bell, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth/auth-provider"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Trading Bots", href: "/dashboard/bots", icon: Bot },
  { name: "Portfolio", href: "/dashboard/portfolio", icon: Wallet },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Signals", href: "/dashboard/signals", icon: TrendingUp },
  { name: "Alerts", href: "/dashboard/alerts", icon: Bell },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const { logout } = useAuth()

  return (
    <div className="flex h-full w-64 flex-col bg-gray-900">
      <div className="flex h-16 items-center justify-center border-b border-gray-800">
        <h1 className="text-xl font-bold text-white">CoinWayFinder</h1>
      </div>

      <nav className="flex-1 space-y-1 px-2 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                isActive ? "bg-gray-800 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
            >
              <item.icon
                className={`mr-3 h-5 w-5 ${isActive ? "text-white" : "text-gray-400 group-hover:text-white"}`}
              />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-gray-800 p-4">
        <Button
          onClick={logout}
          variant="ghost"
          className="w-full justify-start text-gray-300 hover:bg-gray-700 hover:text-white"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}
