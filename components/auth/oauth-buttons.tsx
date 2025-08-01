"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Icons } from "@/components/ui/icons"

interface OAuthButtonsProps {
  mode: "login" | "signup"
}

export function OAuthButtons({ mode }: OAuthButtonsProps) {
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null)
  const { toast } = useToast()

  const handleOAuthSignIn = async (provider: string) => {
    try {
      setLoadingProvider(provider)

      // Redirect to OAuth provider
      window.location.href = `/api/auth/oauth/${provider}?mode=${mode}`
    } catch (error) {
      console.error(`${provider} OAuth error:`, error)
      toast({
        title: "Authentication Error",
        description: `Failed to ${mode === "login" ? "sign in" : "sign up"} with ${provider}. Please try again.`,
        variant: "destructive",
      })
      setLoadingProvider(null)
    }
  }

  const providers = [
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
      className: "bg-gray-900 hover:bg-gray-800 text-white border border-gray-700",
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

  return (
    <div className="grid grid-cols-2 gap-3">
      {providers.map((provider) => (
        <Button
          key={provider.id}
          variant="outline"
          onClick={() => handleOAuthSignIn(provider.id)}
          disabled={loadingProvider !== null}
          className={provider.className}
        >
          {loadingProvider === provider.id ? (
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <provider.icon className="mr-2 h-4 w-4" />
          )}
          {provider.name}
        </Button>
      ))}
    </div>
  )
}
