"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { Camera, Mail, User, Calendar, MapPin, Phone, Globe } from "lucide-react"
import { notificationHelper } from "@/lib/notification-helper"
import { useAuth } from "@/hooks/use-auth"

interface PersonalInfoProps {
  user: {
    id: string
    email: string
    name: string
    avatar?: string
    phone?: string
    location?: string
    website?: string
    bio?: string
    joinedAt: string
    emailVerified: boolean
  }
}

export function PersonalInfo({ user }: PersonalInfoProps) {
  const { token } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: user.name || "",
    phone: user.phone || "",
    location: user.location || "",
    website: user.website || "",
    bio: user.bio || "",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setSaving(true)

    try {
      // Get client IP for logging
      const ipResponse = await fetch("https://api.ipify.org?format=json")
      const { ip } = await ipResponse.json()

      // Update profile
      const response = await fetch("/api/auth/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Failed to update profile")
      }

      // Send email notification
      if (token) {
        notificationHelper.setAuthToken(token)

        const changes = []
        if (formData.name !== user.name) changes.push(`Name: ${user.name} → ${formData.name}`)
        if (formData.phone !== user.phone)
          changes.push(`Phone: ${user.phone || "Not set"} → ${formData.phone || "Not set"}`)
        if (formData.location !== user.location)
          changes.push(`Location: ${user.location || "Not set"} → ${formData.location || "Not set"}`)
        if (formData.website !== user.website)
          changes.push(`Website: ${user.website || "Not set"} → ${formData.website || "Not set"}`)
        if (formData.bio !== user.bio) changes.push(`Bio updated`)

        if (changes.length > 0) {
          await notificationHelper.sendProfileChangeNotification(
            user.email,
            formData.name || user.name,
            "Personal Information Update",
            changes.join(", "),
            ip,
          )
        }
      }

      toast.success("Profile updated successfully")
      setIsEditing(false)
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      // Get client IP for logging
      const ipResponse = await fetch("https://api.ipify.org?format=json")
      const { ip } = await ipResponse.json()

      const formData = new FormData()
      formData.append("avatar", file)

      const response = await fetch("/api/auth/upload-avatar", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to upload avatar")
      }

      // Send email notification
      if (token) {
        notificationHelper.setAuthToken(token)
        await notificationHelper.sendProfileChangeNotification(
          user.email,
          user.name,
          "Profile Picture Update",
          "Profile picture has been updated",
          ip,
        )
      }

      toast.success("Avatar updated successfully")
    } catch (error) {
      console.error("Error uploading avatar:", error)
      toast.error("Failed to upload avatar")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Personal Information
        </CardTitle>
        <CardDescription>Manage your personal details and profile information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar Section */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
              <AvatarFallback className="text-lg">{user.name?.charAt(0)?.toUpperCase() || "U"}</AvatarFallback>
            </Avatar>
            <label
              htmlFor="avatar-upload"
              className="absolute -bottom-1 -right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Camera className="h-4 w-4" />
            </label>
            <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
          </div>
          <div>
            <h3 className="font-semibold">{user.name}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              {user.email}
              {user.emailVerified && (
                <Badge variant="secondary" className="text-xs">
                  Verified
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
              <Calendar className="h-4 w-4" />
              Joined {new Date(user.joinedAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        <Separator />

        {/* Form Fields */}
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              disabled={!isEditing}
              placeholder="Enter your full name"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                disabled={!isEditing}
                placeholder="Enter your phone number"
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="location">Location</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                disabled={!isEditing}
                placeholder="Enter your location"
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="website">Website</Label>
            <div className="relative">
              <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => handleInputChange("website", e.target.value)}
                disabled={!isEditing}
                placeholder="Enter your website URL"
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="bio">Bio</Label>
            <textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleInputChange("bio", e.target.value)}
              disabled={!isEditing}
              placeholder="Tell us about yourself"
              className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
          ) : (
            <>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false)
                  setFormData({
                    name: user.name || "",
                    phone: user.phone || "",
                    location: user.location || "",
                    website: user.website || "",
                    bio: user.bio || "",
                  })
                }}
                disabled={isSaving}
              >
                Cancel
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
