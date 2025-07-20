"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { BarChart3, Bot, Briefcase, Home, Menu, Settings, Signal, TrendingUp, Zap } from "lucide-react"

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "Market Analysis",
    href: "/market-analysis",
    icon: TrendingUp,
  },
  {
    title: "Trading Bots",
    href: "/bots",
    icon: Bot,
  },
  {
    title: "Portfolio",
    href: "/portfolio",
    icon: Briefcase,
  },
  {
    title: "Signals",
    href: "/signals",
    icon: Signal,
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    title: "Integrations",
    href: "/integrations",
    icon: Zap,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
]

interface DashboardSidebarProps {
  className?: string
}

export function DashboardSidebar({ className }: DashboardSidebarProps) {
  const pathname = usePathname()

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center border-b px-4">
        <Link className="flex items-center space-x-2" href="/">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <TrendingUp className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-bold">CoinWayFinder</span>
        </Link>
      </div>
      <ScrollArea className="flex-1 px-3">
        <div className="space-y-2 py-4">
          {sidebarItems.map((item) => {
            const Icon = item.icon
            return (
              <Button
                key={item.href}
                variant={pathname === item.href ? "secondary" : "ghost"}
                className={cn("w-full justify-start", pathname === item.href && "bg-secondary")}
                asChild
              >
                <Link href={item.href}>
                  <Icon className="mr-2 h-4 w-4" />
                  {item.title}
                </Link>
              </Button>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <div className={cn("hidden md:flex", className)}>
        <div className="w-64 border-r bg-background">
          <SidebarContent />
        </div>
      </div>

      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="md:hidden bg-transparent">
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </>
  )
}

export default DashboardSidebar
