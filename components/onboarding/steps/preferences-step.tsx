"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bell, Moon, Sun, Globe, Clock } from "lucide-react"
import type { UserOnboardingData } from "@/types/onboarding"

interface PreferencesStepProps {
  data: UserOnboardingData | null
  onNext: (data?: Partial<UserOnboardingData>) => void
  onPrevious: () => void
  isLoading: boolean
}

const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "es", name: "Español" },
  { code: "fr", name: "Français" },
  { code: "de", name: "Deutsch" },
  { code: "ja", name: "日本語" },
  { code: "ko", name: "한국어" },
  { code: "zh", name: "中文" },
]

const TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Australia/Sydney",
]

export function PreferencesStep({ data, onNext, isLoading }: PreferencesStepProps) {
  const [formData, setFormData] = useState({
    notifications: {
      email: data?.preferences?.notifications?.email ?? true,
      push: data?.preferences?.notifications?.push ?? true,
      sms: data?.preferences?.notifications?.sms ?? false,
    },
    theme: data?.preferences?.theme || "dark",
    language: data?.preferences?.language || "en",
    timezone: data?.preferences?.timezone || "UTC",
  })

  const handleNotificationChange = (type: keyof typeof formData.notifications, value: boolean) => {
    setFormData((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [type]: value,
      },
    }))
  }

  const handleNext = () => {
    onNext({
      preferences: formData,
    })
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-white mb-2">Customize Your Experience</h2>
        <p className="text-gray-300">Set your preferences to make CoinWayFinder work best for you</p>
      </div>

      <div className="space-y-4">
        {/* Notifications */}
        <Card className="bg-slate-700/50 border-slate-600">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-white">
              <Bell className="w-5 h-5 text-blue-400" />
              <span>Notification Preferences</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Email Notifications</Label>
                <p className="text-sm text-gray-400">Receive trading alerts and account updates via email</p>
              </div>
              <Switch
                checked={formData.notifications.email}
                onCheckedChange={(checked) => handleNotificationChange("email", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Push Notifications</Label>
                <p className="text-sm text-gray-400">Get instant notifications in your browser</p>
              </div>
              <Switch
                checked={formData.notifications.push}
                onCheckedChange={(checked) => handleNotificationChange("push", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">SMS Notifications</Label>
                <p className="text-sm text-gray-400">Receive critical alerts via text message</p>
              </div>
              <Switch
                checked={formData.notifications.sms}
                onCheckedChange={(checked) => handleNotificationChange("sms", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Theme */}
        <Card className="bg-slate-700/50 border-slate-600">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-white">
              {formData.theme === "dark" ? (
                <Moon className="w-5 h-5 text-purple-400" />
              ) : (
                <Sun className="w-5 h-5 text-yellow-400" />
              )}
              <span>Theme Preference</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={formData.theme}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, theme: value as any }))}
            >
              <SelectTrigger className="bg-slate-600 border-slate-500 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dark">Dark Theme</SelectItem>
                <SelectItem value="light">Light Theme</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Language */}
        <Card className="bg-slate-700/50 border-slate-600">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-white">
              <Globe className="w-5 h-5 text-green-400" />
              <span>Language</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={formData.language}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, language: value }))}
            >
              <SelectTrigger className="bg-slate-600 border-slate-500 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Timezone */}
        <Card className="bg-slate-700/50 border-slate-600">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-white">
              <Clock className="w-5 h-5 text-orange-400" />
              <span>Timezone</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={formData.timezone}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, timezone: value }))}
            >
              <SelectTrigger className="bg-slate-600 border-slate-500 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz} value={tz}>
                    {tz.replace("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center">
        <Button onClick={handleNext} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 px-8">
          {isLoading ? "Saving..." : "Continue"}
        </Button>
      </div>
    </div>
  )
}
