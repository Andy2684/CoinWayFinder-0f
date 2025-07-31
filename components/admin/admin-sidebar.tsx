import { Mail } from "lucide-react"

const AdminSidebar = () => {
  const navigationItems = [
    {
      title: "Dashboard",
      href: "/admin/dashboard",
      icon: "DashboardIcon",
      description: "View admin dashboard",
    },
    {
      title: "Users",
      href: "/admin/users",
      icon: "UsersIcon",
      description: "Manage users",
    },
    {
      title: "Email Notifications",
      href: "/admin/notifications",
      icon: Mail,
      description: "Configure email alerts and notifications",
    },
    // ** rest of code here **
  ]

  return <div>{/* Sidebar content */}</div>
}

export default AdminSidebar
