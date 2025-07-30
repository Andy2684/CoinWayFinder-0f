"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/ui/icons"
import { Loader2 } from "lucide-react"

interface OAuthButtonsProps {
  disabled?: boolean
}

export function OAuthButtons({ disabled = false }: OAuthButtonsProps) {
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null)

  const handleOAuthLogin = async (provider: "google" | "github") => {
    try {
      setLoadingProvider(provider)

      // Redirect to OAuth initiation endpoint
      window.location.href = `/api/auth/oauth/${provider}`
    } catch (error) {
      console.error(`${provider} OAuth error:`, error)
      setLoadingProvider(null)
    }
  }

  return (
    <div className="space-y-3">
      <Button
        type="button"
        variant="outline"
        className="w-full h-11 border-gray-200 hover:bg-gray-50 bg-transparent"
        onClick={() => handleOAuthLogin("google")}
        disabled={disabled || loadingProvider !== null}
      >
        {loadingProvider === "google" ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Icons.google className="mr-2 h-4 w-4" />
        )}
        Continue with Google
      </Button>

      <Button
        type="button"
        variant="outline"
        className="w-full h-11 border-gray-200 hover:bg-gray-50 bg-transparent"
        onClick={() => handleOAuthLogin("github")}
        disabled={disabled || loadingProvider !== null}
      >
        {loadingProvider === "github" ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Icons.gitHub className="mr-2 h-4 w-4" />
        )}
        Continue with GitHub
      </Button>
    </div>
  )
}
