import type React from "react"
import { Sidebar } from "components/common/Sidebar"
import { Home } from "lucide-react"
import { Bell } from "lucide-react" // Added import for Bell

const AdminSidebar: React.FC = () => {
  const navigation = [
    {
      title: "Dashboard",
      url: "/admin/dashboard",
      icon: Home,
    },
    {
      title: "Notifications",
      url: "/admin/notifications",
      icon: Bell, // Added notifications menu item
    },
    // /** rest of code here **/
  ]

  return <Sidebar navigation={navigation} />
}

export default AdminSidebar
