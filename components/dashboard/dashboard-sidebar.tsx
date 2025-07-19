"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "@/components/auth/auth-provider"
import {
  BarChart3,
  Bot,
  DollarSign,
  Home,
  Menu,
  Settings,
  TrendingUp,
  User,
  Wallet,
  Bell,
  Activity,
  LogOut,
} from "lucide-react"

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    name: "Trading Bots",
    href: "/dashboard/bots",
    icon: Bot,
  },
  {
    name: "Portfolio",
    href: "/dashboard/portfolio",
    icon: Wallet,
  },
  {
    name: "Signals",
    href: "/dashboard/signals",
    icon: TrendingUp,
  },
  {
    name: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
  },
  {
    name: "P&L Tracking",
    href: "/dashboard/pnl",
    icon: DollarSign,
  },
  {
    name: "Alerts",
    href: "/dashboard/alerts",
    icon: Bell,
  },
  {
    name: "Activity",
    href: "/dashboard/activity",
    icon: Activity,
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
]

interface DashboardSidebarProps {
  className?: string
}

export function DashboardSidebar({ className }: DashboardSidebarProps) {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  return (
    <div className={cn("pb-12", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-semibold">Coinwayfinder</h2>
          </div>

          {user && (
            <div className="flex items-center space-x-2 p-2 bg-muted rounded-lg mb-4">
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
              </div>
            </div>
          )}

          <div className="space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                  pathname === item.href
                    ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-100"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
                )}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 left-3 right-3">
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-foreground"
          onClick={logout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}

export function MobileDashboardSidebar() {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-64">
        <ScrollArea className="h-full">
          <DashboardSidebar />
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
