"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/ui/icons"

interface OAuthButtonsProps {
  mode?: "login" | "signup"
}

export function OAuthButtons({ mode = "login" }: OAuthButtonsProps) {
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null)

  const handleOAuthLogin = async (provider: string) => {
    try {
      setLoadingProvider(provider)
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
        className="w-full h-11 bg-white hover:bg-gray-50 border-gray-300"
        onClick={() => handleOAuthLogin("google")}
        disabled={loadingProvider !== null}
      >
        {loadingProvider === "google" ? (
          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Icons.google className="mr-2 h-4 w-4" />
        )}
        Continue with Google
      </Button>

      <Button
        type="button"
        variant="outline"
        className="w-full h-11 bg-white hover:bg-gray-50 border-gray-300"
        onClick={() => handleOAuthLogin("github")}
        disabled={loadingProvider !== null}
      >
        {loadingProvider === "github" ? (
          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Icons.github className="mr-2 h-4 w-4" />
        )}
        Continue with GitHub
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-500">Or continue with email</span>
        </div>
      </div>
    </div>
  )
}
