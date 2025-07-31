"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/ui/icons"
import { useToast } from "@/hooks/use-toast"

interface OAuthButtonsProps {
  mode?: "login" | "signup"
  className?: string
}

export function OAuthButtons({ mode = "login", className }: OAuthButtonsProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const { toast } = useToast()

  const handleOAuthLogin = async (provider: string) => {
    try {
      setLoading(provider)
      window.location.href = `/api/auth/oauth/${provider}`
    } catch (error) {
      console.error(`${provider} OAuth error:`, error)
      toast({
        title: "Authentication Error",
        description: `Failed to ${mode} with ${provider}. Please try again.`,
        variant: "destructive",
      })
      setLoading(null)
    }
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <Button
        type="button"
        variant="outline"
        onClick={() => handleOAuthLogin("google")}
        disabled={loading !== null}
        className="w-full bg-white hover:bg-gray-50 text-gray-900 border-gray-300"
      >
        {loading === "google" ? (
          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Icons.google className="mr-2 h-4 w-4" />
        )}
        Continue with Google
      </Button>

      <Button
        type="button"
        variant="outline"
        onClick={() => handleOAuthLogin("github")}
        disabled={loading !== null}
        className="w-full bg-gray-900 hover:bg-gray-800 text-white border-gray-700"
      >
        {loading === "github" ? (
          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Icons.github className="mr-2 h-4 w-4" />
        )}
        Continue with GitHub
      </Button>
    </div>
  )
}
