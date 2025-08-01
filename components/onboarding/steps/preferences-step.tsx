"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Bell, Mail, MessageSquare, Smartphone, Palette, Globe, Clock } from "lucide-react"
import type { UserOnboardingData } from "@/types/onboarding"

interface PreferencesStepProps {
  data: UserOnboardingData | null
  onNext: (data?: Partial<UserOnboardingData>) => void
  onPrevious: () => void
  isLoading: boolean
}

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

  const languages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "es", name: "Español", flag: "🇪🇸" },
    { code: "fr", name: "Français", flag: "🇫🇷" },
    { code: "de", name: "Deutsch", flag: "🇩🇪" },
    { code: "ja", name: "日本語", flag: "🇯🇵" },
    { code: "ko", name: "한국어", flag: "🇰🇷" },
    { code: "zh", name: "中文", flag: "🇨🇳" },
    { code: "ru", name: "Русский", flag: "🇷🇺" },
  ]

  const timezones = [
    "UTC",
    "America/New_York",
    "America/Los_Angeles",
    "Europe/London",
    "Europe/Berlin",
    "Asia/Tokyo",
    "Asia/Shanghai",
    "Asia/Seoul",
    "Australia/Sydney",
    "America/Toronto",
  ]

  const handleSubmit = () => {
    onNext({
      preferences: formData,
    })
  }

  const updateNotification = (type: keyof typeof formData.notifications, value: boolean) => {
    setFormData((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [type]: value,
      },
    }))
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Customize Your Experience</h2>
        <p className="text-gray-300">Set your preferences to make CoinWayFinder work perfectly for you</p>
      </div>

      {/* Notification Preferences */}
      <Card className="bg-slate-700/50 border-slate-600">
        <CardContent className="p-6 space-y-6">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Bell className="w-5 h-5 mr-2" />
            Notification Preferences
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-600/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-blue-400" />
                <div>
                  <Label className="text-white font-medium">Email Notifications</Label>
                  <p className="text-sm text-gray-400">Trading alerts, market updates, and account security</p>
                </div>
              </div>
              <Switch
                checked={formData.notifications.email}
                onCheckedChange={(checked) => updateNotification("email", checked)}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-600/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Smartphone className="w-5 h-5 text-green-400" />
                <div>
                  <Label className="text-white font-medium">Push Notifications</Label>
                  <p className="text-sm text-gray-400">Real-time alerts on your device</p>
                </div>
              </div>
              <Switch
                checked={formData.notifications.push}
                onCheckedChange={(checked) => updateNotification("push", checked)}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-600/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <MessageSquare className="w-5 h-5 text-purple-400" />
                <div>
                  <Label className="text-white font-medium">SMS Notifications</Label>
                  <p className="text-sm text-gray-400">Critical alerts via text message</p>
                </div>
              </div>
              <Switch
                checked={formData.notifications.sms}
                onCheckedChange={(checked) => updateNotification("sms", checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Theme Selection */}
      <Card className="bg-slate-700/50 border-slate-600">
        <CardContent className="p-6 space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Palette className="w-5 h-5 mr-2" />
            Theme Preference
          </h3>

          <RadioGroup
            value={formData.theme}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, theme: value as any }))}
            className="grid grid-cols-2 gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="dark" id="dark" />
              <Label htmlFor="dark" className="flex-1 cursor-pointer">
                <Card
                  className={`p-4 transition-colors ${
                    formData.theme === "dark"
                      ? "bg-blue-500/20 border-blue-500"
                      : "bg-slate-600/50 border-slate-500 hover:border-slate-400"
                  }`}
                >
                  <div className="text-center">
                    <div className="w-12 h-8 bg-slate-800 rounded mb-2 mx-auto border border-slate-600"></div>
                    <p className="text-white font-medium">Dark Mode</p>
                    <p className="text-xs text-gray-400">Easy on the eyes</p>
                  </div>
                </Card>
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <RadioGroupItem value="light" id="light" />
              <Label htmlFor="light" className="flex-1 cursor-pointer">
                <Card
                  className={`p-4 transition-colors ${
                    formData.theme === "light"
                      ? "bg-blue-500/20 border-blue-500"
                      : "bg-slate-600/50 border-slate-500 hover:border-slate-400"
                  }`}
                >
                  <div className="text-center">
                    <div className="w-12 h-8 bg-white rounded mb-2 mx-auto border border-gray-300"></div>
                    <p className="text-white font-medium">Light Mode</p>
                    <p className="text-xs text-gray-400">Classic look</p>
                  </div>
                </Card>
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Language Selection */}
      <Card className="bg-slate-700/50 border-slate-600">
        <CardContent className="p-6 space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Globe className="w-5 h-5 mr-2" />
            Language
          </h3>

          <Select
            value={formData.language}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, language: value }))}
          >
            <SelectTrigger className="bg-slate-600 border-slate-500 text-white">
              <SelectValue placeholder="Select your language" />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  <div className="flex items-center space-x-2">
                    <span>{lang.flag}</span>
                    <span>{lang.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Timezone Selection */}
      <Card className="bg-slate-700/50 border-slate-600">
        <CardContent className="p-6 space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Timezone
          </h3>

          <Select
            value={formData.timezone}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, timezone: value }))}
          >
            <SelectTrigger className="bg-slate-600 border-slate-500 text-white">
              <SelectValue placeholder="Select your timezone" />
            </SelectTrigger>
            <SelectContent>
              {timezones.map((tz) => (
                <SelectItem key={tz} value={tz}>
                  {tz.replace("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-400">Used for displaying market hours and scheduling notifications</p>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button onClick={handleSubmit} disabled={isLoading} size="lg" className="bg-blue-600 hover:bg-blue-700 px-8">
          {isLoading ? "Saving Preferences..." : "Continue to Exchange Setup"}
        </Button>
      </div>
    </div>
  )
}
