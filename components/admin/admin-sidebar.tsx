import type React from "react"
import { Settings } from "lucide-react"
import { History } from "lucide-react"

const AdminSidebar: React.FC = () => {
  const navigationItems = [
    {
      title: "Dashboard",
      href: "/admin/dashboard",
      icon: "DashboardIcon",
    },
    {
      title: "Users",
      href: "/admin/users",
      icon: "UsersIcon",
    },
    {
      title: "Notifications",
      items: [
        {
          title: "Settings",
          href: "/admin/notifications",
          icon: Settings,
        },
        {
          title: "History",
          href: "/admin/notifications/history",
          icon: History,
        },
      ],
    },
    //** rest of code here **/
  ]

  return <div>{/* Sidebar content */}</div>
}

export default AdminSidebar
