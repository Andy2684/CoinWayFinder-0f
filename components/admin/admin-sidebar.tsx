import React from "react"
import { LayoutDashboard, Users, Key, FileText, Shield, Bell, Mail, BarChart3, CheckCircle } from "icons"

const AdminSidebar = () => {
  const navigation = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "OAuth Accounts", href: "/admin/oauth", icon: Key },
    { name: "Audit Logs", href: "/admin/audit-logs", icon: FileText },
    { name: "Security", href: "/admin/security", icon: Shield },
    { name: "Notifications", href: "/admin/notifications", icon: Bell },
    { name: "Email Queue", href: "/admin/email-queue", icon: Mail },
    { name: "Reports", href: "/admin/reports", icon: BarChart3 },
    { name: "Compliance", href: "/admin/compliance", icon: CheckCircle },
  ]

  return (
    <nav>
      <ul>
        {navigation.map((item) => (
          <li key={item.name}>
            <a href={item.href}>
              {React.createElement(item.icon)}
              {item.name}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default AdminSidebar
