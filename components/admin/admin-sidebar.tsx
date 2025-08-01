"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Users,
  Shield,
  FileText,
  Settings,
  BarChart3,
  Bell,
  Database,
  Activity,
  Mail,
  UserCheck,
  Clock,
  TrendingUp,
} from "lucide-react"

const adminNavItems = [
  {
    title: "Overview",
    href: "/admin",
    icon: BarChart3,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Security",
    href: "/admin/security",
    icon: Shield,
  },
  {
    title: "Audit Logs",
    href: "/admin/audit-logs",
    icon: FileText,
  },
  {
    title: "Notifications",
    href: "/admin/notifications",
    icon: Bell,
    children: [
      {
        title: "Settings",
        href: "/admin/notifications",
        icon: Settings,
      },
      {
        title: "History",
        href: "/admin/notifications/history",
        icon: Clock,
      },
      {
        title: "Email Queue",
        href: "/admin/email-queue",
        icon: Mail,
      },
    ],
  },
  {
    title: "Reports",
    href: "/admin/reports",
    icon: TrendingUp,
  },
  {
    title: "Compliance",
    href: "/admin/compliance",
    icon: UserCheck,
  },
  {
    title: "System Health",
    href: "/admin/system",
    icon: Activity,
  },
  {
    title: "Database",
    href: "/admin/database",
    icon: Database,
  },
]

interface AdminSidebarProps {
  className?: string
}

export function AdminSidebar({ className }: AdminSidebarProps) {
  const pathname = usePathname()

  return (
    <div className={cn("flex h-full w-64 flex-col bg-slate-900 border-r border-slate-800", className)}>
      <div className="flex h-16 items-center border-b border-slate-800 px-6">
        <h2 className="text-lg font-semibold text-white">Admin Panel</h2>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {adminNavItems.map((item) => {
          const isActive = pathname === item.href
          const hasChildren = item.children && item.children.length > 0

          return (
            <div key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white",
                )}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.title}
              </Link>

              {hasChildren && (
                <div className="ml-6 mt-1 space-y-1">
                  {item.children?.map((child) => {
                    const isChildActive = pathname === child.href
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          "flex items-center rounded-lg px-3 py-2 text-sm transition-colors",
                          isChildActive
                            ? "bg-blue-500 text-white"
                            : "text-slate-400 hover:bg-slate-800 hover:text-white",
                        )}
                      >
                        <child.icon className="mr-3 h-4 w-4" />
                        {child.title}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      <div className="border-t border-slate-800 p-4">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
            <Shield className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">Admin User</p>
            <p className="text-xs text-slate-400">Administrator</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Default export for compatibility
export default AdminSidebar
