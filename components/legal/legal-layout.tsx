"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ArrowLeft, FileText, Shield, Cookie, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface LegalLayoutProps {
  children: React.ReactNode
}

export function LegalLayout({ children }: LegalLayoutProps) {
  const pathname = usePathname()

  const legalPages = [
    {
      title: "Privacy Policy",
      href: "/legal/privacy",
      icon: Shield,
      description: "How we handle your data",
    },
    {
      title: "Terms of Service",
      href: "/legal/terms",
      icon: FileText,
      description: "User agreement & rules",
    },
    {
      title: "Cookie Policy",
      href: "/legal/cookies",
      icon: Cookie,
      description: "Cookie usage & preferences",
    },
    {
      title: "Security Guidelines",
      href: "/legal/security",
      icon: Lock,
      description: "Security best practices",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Legal Center</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Important information about your rights and our policies
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardContent className="p-6">
                <h2 className="font-semibold text-lg mb-4 text-gray-900 dark:text-white">Legal Documents</h2>
                <nav className="space-y-2">
                  {legalPages.map((page) => {
                    const Icon = page.icon
                    const isActive = pathname === page.href

                    return (
                      <Link key={page.href} href={page.href}>
                        <div
                          className={cn(
                            "flex items-start space-x-3 p-3 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-700",
                            isActive && "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500",
                          )}
                        >
                          <Icon className={cn("h-5 w-5 mt-0.5", isActive ? "text-blue-600" : "text-gray-500")} />
                          <div>
                            <div
                              className={cn(
                                "font-medium text-sm",
                                isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-900 dark:text-white",
                              )}
                            >
                              {page.title}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{page.description}</div>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </nav>

                {/* Last Updated */}
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Last updated: {new Date().toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="p-8">{children}</CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
