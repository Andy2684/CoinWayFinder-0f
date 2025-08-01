"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Upload, User } from "lucide-react"
import type { UserOnboardingData } from "@/types/onboarding"

interface ProfileStepProps {
  data: UserOnboardingData | null
  onNext: (data?: Partial<UserOnboardingData>) => void
  onPrevious: () => void
  isLoading: boolean
}

const COUNTRIES = [
  "United States",
  "Canada",
  "United Kingdom",
  "Germany",
  "France",
  "Japan",
  "Australia",
  "Singapore",
  "Other",
]

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

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

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

  const handleNext = () => {
    if (validateForm()) {
      onNext({
        profile: {
          ...data?.profile,
          ...formData,
        },
      })
    }
  }

  const getInitials = () => {
    return `${formData.firstName.charAt(0)}${formData.lastName.charAt(0)}`.toUpperCase()
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-white mb-2">Complete Your Profile</h2>
        <p className="text-gray-300">Help us personalize your CoinWayFinder experience</p>
      </div>

      <div className="space-y-4">
        {/* Avatar Upload */}
        <div className="flex justify-center">
          <div className="relative">
            <Avatar className="w-20 h-20">
              <AvatarImage src={formData.avatar || "/placeholder.svg"} />
              <AvatarFallback className="bg-blue-500 text-white text-lg">
                {getInitials() || <User className="w-8 h-8" />}
              </AvatarFallback>
            </Avatar>
            <Button
              size="sm"
              variant="outline"
              className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full p-0 bg-slate-700 border-slate-600"
            >
              <Upload className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Name Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-white">
              First Name *
            </Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => handleInputChange("firstName", e.target.value)}
              className="bg-slate-700 border-slate-600 text-white"
              placeholder="Enter your first name"
            />
            {errors.firstName && <p className="text-red-400 text-sm">{errors.firstName}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-white">
              Last Name *
            </Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => handleInputChange("lastName", e.target.value)}
              className="bg-slate-700 border-slate-600 text-white"
              placeholder="Enter your last name"
            />
            {errors.lastName && <p className="text-red-400 text-sm">{errors.lastName}</p>}
          </div>
        </div>

        {/* Date of Birth */}
        <div className="space-y-2">
          <Label htmlFor="dateOfBirth" className="text-white">
            Date of Birth (Optional)
          </Label>
          <Input
            id="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
            className="bg-slate-700 border-slate-600 text-white"
          />
          {errors.dateOfBirth && <p className="text-red-400 text-sm">{errors.dateOfBirth}</p>}
        </div>

        {/* Country */}
        <div className="space-y-2">
          <Label className="text-white">Country (Optional)</Label>
          <Select value={formData.country} onValueChange={(value) => handleInputChange("country", value)}>
            <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
              <SelectValue placeholder="Select your country" />
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map((country) => (
                <SelectItem key={country} value={country}>
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Phone Number */}
        <div className="space-y-2">
          <Label htmlFor="phoneNumber" className="text-white">
            Phone Number (Optional)
          </Label>
          <Input
            id="phoneNumber"
            value={formData.phoneNumber}
            onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
            className="bg-slate-700 border-slate-600 text-white"
            placeholder="+1 (555) 123-4567"
          />
          {errors.phoneNumber && <p className="text-red-400 text-sm">{errors.phoneNumber}</p>}
          <p className="text-xs text-gray-400">We'll use this for important account notifications</p>
        </div>
      </div>

      <div className="flex justify-center">
        <Button onClick={handleNext} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 px-8">
          {isLoading ? "Saving..." : "Continue"}
        </Button>
      </div>
    </div>
  )
}
