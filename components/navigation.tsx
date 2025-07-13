import { Home, TrendingUp, Bot, Settings, BarChart3, Search } from "lucide-react"

import type { MainNavItem, SidebarNavItem } from "@/types"

interface DashboardConfig {
  mainNav: MainNavItem[]
  sidebarNav: SidebarNavItem[]
}

export const dashboardConfig: DashboardConfig = {
  mainNav: [
    {
      title: "Home",
      href: "/",
    },
  ],
  sidebarNav: [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Screener", href: "/screener", icon: Search },
    { name: "Signals", href: "/signals", icon: TrendingUp },
    { name: "Trading Bots", href: "/bots", icon: Bot },
    { name: "Integrations", href: "/integrations", icon: Settings },
    { name: "News", href: "/news", icon: BarChart3 },
    {
      title: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
    },
  ],
}
