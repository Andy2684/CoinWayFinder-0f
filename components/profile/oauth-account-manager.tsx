"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { Icons } from "@/components/ui/icons"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Link2, Unlink, Shield, CheckCircle, Plus } from "lucide-react"

interface OAuthAccount {
  provider: string
  providerId: string
  email: string
  name: string
  avatar?: string
  linkedAt: string
  lastUsed?: string
}

const providerConfig = {
  google: {
    name: "Google",
    icon: Icons.google,
    color: "bg-red-500",
    textColor: "text-red-700",
    bgColor: "bg-red-50",
  },
  github: {
    name: "GitHub",
    icon: Icons.github,
    color: "bg-gray-800",
    textColor: "text-gray-700",
    bgColor: "bg-gray-50",
  },
  twitter: {
    name: "Twitter",
    icon: Icons.twitter,
    color: "bg-blue-500",
    textColor: "text-blue-700",
    bgColor: "bg-blue-50",
  },
  discord: {
    name: "Discord",
    icon: Icons.discord,
    color: "bg-indigo-600",
    textColor: "text-indigo-700",
    bgColor: "bg-indigo-50",
  },
}

export function OAuthAccountManager() {
  const [accounts, setAccounts] = useState<OAuthAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [unlinkingProvider, setUnlinkingProvider] = useState<string | null>(null)
  const [linkingProvider, setLinkingProvider] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchOAuthAccounts()
  }, [])

  const fetchOAuthAccounts = async () => {
    try {
      const response = await fetch("/api/auth/oauth/accounts")
      const data = await response.json()

      if (data.success) {
        setAccounts(data.accounts || [])
      } else {
        throw new Error(data.error || "Failed to fetch OAuth accounts")
      }
    } catch (error) {
      console.error("Error fetching OAuth accounts:", error)
      toast({
        title: "Error",
        description: "Failed to load connected accounts. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLinkAccount = async (provider: string) => {
    try {
      setLinkingProvider(provider)
      window.location.href = `/api/auth/oauth/${provider}?link=true`
    } catch (error) {
      console.error(`Error linking ${provider} account:`, error)
      toast({
        title: "Error",
        description: `Failed to link ${provider} account. Please try again.`,
        variant: "destructive",
      })
      setLinkingProvider(null)
    }
  }

  const handleUnlinkAccount = async (provider: string) => {
    try {
      setUnlinkingProvider(provider)

      const response = await fetch("/api/auth/oauth/accounts", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ provider }),
      })

      const data = await response.json()

      if (data.success) {
        setAccounts(accounts.filter((account) => account.provider !== provider))
        toast({
          title: "Account Unlinked",
          description: `Your ${providerConfig[provider as keyof typeof providerConfig]?.name} account has been unlinked.`,
        })
      } else {
        throw new Error(data.error || "Failed to unlink account")
      }
    } catch (error) {
      console.error(`Error unlinking ${provider} account:`, error)
      toast({
        title: "Error",
        description: `Failed to unlink ${provider} account. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setUnlinkingProvider(null)
    }
  }

  const getAvailableProviders = () => {
    const linkedProviders = accounts.map((account) => account.provider)
    return Object.keys(providerConfig).filter((provider) => !linkedProviders.includes(provider))
  }

  if (loading) {
    return (
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Connected Accounts
          </CardTitle>
          <CardDescription>Loading your connected OAuth accounts...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center space-x-4 p-4 bg-slate-700/50 rounded-lg animate-pulse">
                <div className="w-10 h-10 bg-slate-600 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-600 rounded w-1/4" />
                  <div className="h-3 bg-slate-600 rounded w-1/2" />
                </div>
                <div className="w-20 h-8 bg-slate-600 rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Connected Accounts */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Connected Accounts
          </CardTitle>
          <CardDescription>
            Manage your connected social accounts for easy sign-in and enhanced security.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {accounts.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No Connected Accounts</h3>
              <p className="text-gray-400 mb-4">
                Connect your social accounts for faster sign-in and improved account security.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {accounts.map((account) => {
                const config = providerConfig[account.provider as keyof typeof providerConfig]
                if (!config) return null

                const IconComponent = config.icon

                return (
                  <div
                    key={`${account.provider}-${account.providerId}`}
                    className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg border border-slate-600"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-full ${config.color}`}>
                        <IconComponent className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-white">{config.name}</h4>
                          <Badge variant="outline" className="text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Connected
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                          <span>{account.email}</span>
                          <span>•</span>
                          <span>Connected {new Date(account.linkedAt).toLocaleDateString()}</span>
                          {account.lastUsed && (
                            <>
                              <span>•</span>
                              <span>Last used {new Date(account.lastUsed).toLocaleDateString()}</span>
                            </>
                          )}
                        </div>
                      </div>
                      {account.avatar && (
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={account.avatar || "/placeholder.svg"} alt={account.name} />
                          <AvatarFallback>{account.name.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={unlinkingProvider === account.provider}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10 bg-transparent"
                        >
                          {unlinkingProvider === account.provider ? (
                            <Icons.spinner className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <Unlink className="h-4 w-4 mr-2" />
                          )}
                          Unlink
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-slate-800 border-slate-700">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-white">Unlink {config.name} Account</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to unlink your {config.name} account? You will no longer be able to
                            sign in using this account.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleUnlinkAccount(account.provider)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Unlink Account
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Providers to Link */}
      {getAvailableProviders().length > 0 && (
        <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Link Additional Accounts
            </CardTitle>
            <CardDescription>
              Connect more accounts to have multiple sign-in options and improve account security.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {getAvailableProviders().map((provider) => {
                const config = providerConfig[provider as keyof typeof providerConfig]
                if (!config) return null

                const IconComponent = config.icon

                return (
                  <div
                    key={provider}
                    className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600 hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${config.color}`}>
                        <IconComponent className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium text-white">{config.name}</h4>
                        <p className="text-sm text-gray-400">Connect your {config.name} account</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleLinkAccount(provider)}
                      disabled={linkingProvider === provider}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {linkingProvider === provider ? (
                        <Icons.spinner className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Link2 className="h-4 w-4 mr-2" />
                      )}
                      Connect
                    </Button>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Security Notice */}
      <Card className="bg-blue-500/10 border-blue-500/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <h4 className="text-blue-500 font-medium">Account Security</h4>
              <ul className="text-sm text-blue-200 mt-2 space-y-1">
                <li>• Connected accounts provide additional security through two-factor authentication</li>
                <li>• You can sign in using any of your connected accounts</li>
                <li>• Unlinking an account will not affect your other sign-in methods</li>
                <li>• We recommend keeping at least one account connected for account recovery</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
