"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/ui/icons"
import { Loader2 } from "lucide-react"

const oauthProviders = [
  {
    id: "google",
    name: "Google",
    icon: Icons.google,
    className: "bg-white hover:bg-gray-50 text-gray-900 border border-gray-300",
  },
  {
    id: "github",
    name: "GitHub",
    icon: Icons.gitHub,
    className: "bg-gray-900 hover:bg-gray-800 text-white",
  },
  {
    id: "twitter",
    name: "Twitter",
    icon: Icons.twitter,
    className: "bg-blue-500 hover:bg-blue-600 text-white",
  },
  {
    id: "discord",
    name: "Discord",
    icon: Icons.discord,
    className: "bg-indigo-600 hover:bg-indigo-700 text-white",
  },
]

export function OAuthButtons() {
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null)

  const handleOAuthLogin = async (providerId: string) => {
    setLoadingProvider(providerId)
    try {
      // Redirect to OAuth provider
      window.location.href = `/api/auth/oauth/${providerId}`
    } catch (error) {
      console.error(`OAuth login error for ${providerId}:`, error)
      setLoadingProvider(null)
    }
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {oauthProviders.map((provider) => {
        const Icon = provider.icon
        const isLoading = loadingProvider === provider.id

        return (
          <Button
            key={provider.id}
            variant="outline"
            onClick={() => handleOAuthLogin(provider.id)}
            disabled={isLoading}
            className={`${provider.className} transition-colors`}
          >
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Icon className="mr-2 h-4 w-4" />}
            {provider.name}
          </Button>
        )
      })}
    </div>
  )
}
