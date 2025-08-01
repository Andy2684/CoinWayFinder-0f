"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Upload, User, Calendar, MapPin, Phone } from "lucide-react"
import type { UserOnboardingData } from "@/types/onboarding"

interface ProfileStepProps {
  data: UserOnboardingData | null
  onNext: (data?: Partial<UserOnboardingData>) => void
  onPrevious: () => void
  isLoading: boolean
}

export function ProfileStep({ data, onNext, isLoading }: ProfileStepProps) {
  const [formData, setFormData] = useState({
    firstName: data?.profile?.firstName || "",
    lastName: data?.profile?.lastName || "",
    dateOfBirth: data?.profile?.dateOfBirth || "",
    country: data?.profile?.country || "",
    phoneNumber: data?.profile?.phoneNumber || "",
    avatar: data?.profile?.avatar || "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const countries = [
    "United States",
    "Canada",
    "United Kingdom",
    "Germany",
    "France",
    "Japan",
    "Australia",
    "Singapore",
    "Switzerland",
    "Netherlands",
    "Sweden",
    "Other",
  ]

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required"
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required"
    }

    if (formData.dateOfBirth) {
      const birthDate = new Date(formData.dateOfBirth)
      const today = new Date()
      const age = today.getFullYear() - birthDate.getFullYear()

      if (age < 18) {
        newErrors.dateOfBirth = "You must be at least 18 years old"
      }
    }

    if (formData.phoneNumber && !/^\+?[\d\s\-$$$$]+$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Please enter a valid phone number"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validateForm()) {
      onNext({
        profile: formData,
      })
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const getInitials = () => {
    return `${formData.firstName.charAt(0)}${formData.lastName.charAt(0)}`.toUpperCase()
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Complete Your Profile</h2>
        <p className="text-gray-300">Help us personalize your CoinWayFinder experience and ensure account security</p>
      </div>

      <Card className="bg-slate-700/50 border-slate-600">
        <CardContent className="p-6 space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="w-24 h-24">
              <AvatarImage src={formData.avatar || "/placeholder.svg"} />
              <AvatarFallback className="bg-blue-500 text-white text-xl">
                {getInitials() || <User className="w-8 h-8" />}
              </AvatarFallback>
            </Avatar>
            <Button variant="outline" size="sm" className="bg-slate-600 border-slate-500">
              <Upload className="w-4 h-4 mr-2" />
              Upload Photo
            </Button>
            <p className="text-xs text-gray-400 text-center">
              Optional: Add a profile picture to personalize your account
            </p>
          </div>

          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-white flex items-center">
                <User className="w-4 h-4 mr-2" />
                First Name *
              </Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                placeholder="Enter your first name"
                className="bg-slate-600 border-slate-500 text-white"
              />
              {errors.firstName && <p className="text-red-400 text-sm">{errors.firstName}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-white flex items-center">
                <User className="w-4 h-4 mr-2" />
                Last Name *
              </Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                placeholder="Enter your last name"
                className="bg-slate-600 border-slate-500 text-white"
              />
              {errors.lastName && <p className="text-red-400 text-sm">{errors.lastName}</p>}
            </div>
          </div>

          {/* Date of Birth */}
          <div className="space-y-2">
            <Label htmlFor="dateOfBirth" className="text-white flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              Date of Birth (Optional)
            </Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
              className="bg-slate-600 border-slate-500 text-white"
            />
            {errors.dateOfBirth && <p className="text-red-400 text-sm">{errors.dateOfBirth}</p>}
            <p className="text-xs text-gray-400">Helps us provide age-appropriate trading recommendations</p>
          </div>

          {/* Country */}
          <div className="space-y-2">
            <Label className="text-white flex items-center">
              <MapPin className="w-4 h-4 mr-2" />
              Country (Optional)
            </Label>
            <Select value={formData.country} onValueChange={(value) => handleInputChange("country", value)}>
              <SelectTrigger className="bg-slate-600 border-slate-500 text-white">
                <SelectValue placeholder="Select your country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-400">
              Helps us comply with local regulations and provide relevant features
            </p>
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <Label htmlFor="phoneNumber" className="text-white flex items-center">
              <Phone className="w-4 h-4 mr-2" />
              Phone Number (Optional)
            </Label>
            <Input
              id="phoneNumber"
              value={formData.phoneNumber}
              onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
              placeholder="+1 (555) 123-4567"
              className="bg-slate-600 border-slate-500 text-white"
            />
            {errors.phoneNumber && <p className="text-red-400 text-sm">{errors.phoneNumber}</p>}
            <p className="text-xs text-gray-400">For account security and important trading notifications</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button
          onClick={handleSubmit}
          disabled={isLoading || !formData.firstName || !formData.lastName}
          size="lg"
          className="bg-blue-600 hover:bg-blue-700 px-8"
        >
          {isLoading ? "Saving Profile..." : "Continue to Experience Setup"}
        </Button>
      </div>

      <p className="text-center text-sm text-gray-400">* Required fields. Your information is encrypted and secure.</p>
    </div>
  )
}
