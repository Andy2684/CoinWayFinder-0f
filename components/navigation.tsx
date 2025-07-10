"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Bot, Menu } from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Bots", href: "/bots" },
  { name: "Integrations", href: "/integrations" },
  { name: "News", href: "/news" },
  { name: "Pricing", href: "/subscription" },
  { name: "API Docs", href: "/api-docs" },
]

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-gray-900/75 border-b border-gray-800">
      <nav className="flex items-center justify-between p-6 lg:px-8" aria-label="Global">
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5 flex items-center space-x-2">
            <Bot className="h-8 w-8 text-[#30D5C8]" />
            <span className="text-xl font-bold text-white">CoinWayFinder</span>
          </Link>
        </div>

        <div className="flex lg:hidden">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="text-white">
                <span className="sr-only">Open main menu</span>
                <Menu className="h-6 w-6" aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-gray-900 border-gray-800">
              <div className="flex items-center justify-between mb-8">
                <Link href="/" className="flex items-center space-x-2">
                  <Bot className="h-8 w-8 text-[#30D5C8]" />
                  <span className="text-xl font-bold text-white">CoinWayFinder</span>
                </Link>
              </div>
              <div className="flow-root">
                <div className="-my-6 divide-y divide-gray-700">
                  <div className="space-y-2 py-6">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-white hover:bg-gray-800"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                  <div className="py-6">
                    <Link href="/dashboard">
                      <Button className="w-full bg-[#30D5C8] text-black hover:bg-[#30D5C8]/90">Get Started</Button>
                    </Link>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="hidden lg:flex lg:gap-x-12">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm font-semibold leading-6 text-white hover:text-[#30D5C8] transition-colors"
            >
              {item.name}
            </Link>
          ))}
        </div>

        <div className="hidden lg:flex lg:flex-1 lg:justify-end">
          <Link href="/dashboard">
            <Button className="bg-[#30D5C8] text-black hover:bg-[#30D5C8]/90">Get Started</Button>
          </Link>
        </div>
      </nav>
    </header>
  )
}
