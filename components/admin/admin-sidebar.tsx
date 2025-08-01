"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Users,
  Shield,
  FileText,
  Bell,
  Settings,
  BarChart3,
  Database,
  Mail,
  Activity,
  Home,
  ChevronRight,
} from "lucide-react"

const adminNavItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: Home,
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
        title: "History",
        href: "/admin/notifications/history",
      },
      {
        title: "Settings",
        href: "/admin/notifications/settings",
      },
    ],
  },
  {
    title: "Reports",
    href: "/admin/reports",
    icon: BarChart3,
  },
  {
    title: "Compliance",
    href: "/admin/compliance",
    icon: FileText,
  },
  {
    title: "Email Queue",
    href: "/admin/email-queue",
    icon: Mail,
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
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col bg-slate-900 border-r border-slate-700">
      <div className="flex h-16 items-center px-6 border-b border-slate-700">
        <h2 className="text-lg font-semibold text-white">Admin Panel</h2>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {adminNavItems.map((item) => (
          <div key={item.href}>
            <Link
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                pathname === item.href
                  ? "bg-slate-800 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white",
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.title}
              {item.children && <ChevronRight className="ml-auto h-4 w-4" />}
            </Link>
            {item.children && (
              <div className="ml-6 mt-1 space-y-1">
                {item.children.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    className={cn(
                      "block px-3 py-2 text-sm rounded-md transition-colors",
                      pathname === child.href
                        ? "bg-slate-800 text-white"
                        : "text-slate-400 hover:bg-slate-800 hover:text-white",
                    )}
                  >
                    {child.title}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  )
}

// Default export for compatibility
export default AdminSidebar
