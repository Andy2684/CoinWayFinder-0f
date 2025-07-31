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

  const providers = [
    {
      id: "google",
      name: "Google",
      icon: Icons.google,
      className: "bg-white hover:bg-gray-50 text-gray-900 border-gray-300",
    },
    {
      id: "github",
      name: "GitHub",
      icon: Icons.github,
      className: "bg-gray-900 hover:bg-gray-800 text-white border-gray-700",
    },
    {
      id: "twitter",
      name: "Twitter",
      icon: Icons.twitter,
      className: "bg-blue-500 hover:bg-blue-600 text-white border-blue-600",
    },
    {
      id: "discord",
      name: "Discord",
      icon: Icons.discord,
      className: "bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-700",
    },
  ]

  return (
    <div className={`space-y-3 ${className}`}>
      {providers.map((provider) => {
        const IconComponent = provider.icon
        return (
          <Button
            key={provider.id}
            type="button"
            variant="outline"
            onClick={() => handleOAuthLogin(provider.id)}
            disabled={loading !== null}
            className={`w-full ${provider.className}`}
          >
            {loading === provider.id ? (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <IconComponent className="mr-2 h-4 w-4" />
            )}
            Continue with {provider.name}
          </Button>
        )
      })}
    </div>
  )
}
