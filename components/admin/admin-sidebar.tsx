"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Shield, Users, Mail, BarChart3, Settings, Database, Activity, AlertTriangle, FileText } from "lucide-react"

const navigation = [
  { name: "Overview", href: "/admin", icon: BarChart3 },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Email Queue", href: "/admin/email-queue", icon: Mail },
  { name: "System Logs", href: "/admin/logs", icon: FileText },
  { name: "Database", href: "/admin/database", icon: Database },
  { name: "Monitoring", href: "/admin/monitoring", icon: Activity },
  { name: "Alerts", href: "/admin/alerts", icon: AlertTriangle },
  { name: "Settings", href: "/admin/settings", icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-gray-900/95 backdrop-blur-sm border-r border-gray-800">
      <div className="flex h-16 items-center px-6 border-b border-gray-800">
        <Shield className="h-8 w-8 text-red-400" />
        <span className="ml-2 text-xl font-bold text-white">Admin Panel</span>
      </div>

      <nav className="mt-6 px-3">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive ? "bg-red-600 text-white" : "text-gray-300 hover:bg-gray-800 hover:text-white",
                  )}
                >
                  <item.icon
                    className={cn(
                      "mr-3 h-5 w-5 flex-shrink-0",
                      isActive ? "text-white" : "text-gray-400 group-hover:text-white",
                    )}
                  />
                  {item.name}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}
