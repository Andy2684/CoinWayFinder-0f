"use client"

import { useState } from "react"
import { Bell } from "react-icons/bi"
import { NotificationPreferences } from "./notification-preferences"

const ProfileOverview = () => {
  const [activeTab, setActiveTab] = useState("overview")

  const tabs = [
    { id: "overview", label: "Overview", icon: "OverviewIcon" },
    { id: "settings", label: "Settings", icon: "SettingsIcon" },
    { id: "notifications", label: "Notifications", icon: Bell },
  ]

  return (
    <div>
      <div>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{ backgroundColor: activeTab === tab.id ? "blue" : "white" }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>
      <div>
        {activeTab === "overview" && <div>Overview Content</div>}
        {activeTab === "settings" && <div>Settings Content</div>}
        {activeTab === "notifications" && <NotificationPreferences />}
      </div>
    </div>
  )
}

export default ProfileOverview
