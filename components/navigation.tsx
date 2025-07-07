"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Bot, BarChart3, MessageSquare, Settings, User } from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
  { name: "Bots", href: "/bots", icon: Bot },
  { name: "News", href: "/news", icon: MessageSquare },
  { name: "Integrations", href: "/integrations", icon: Settings },
]

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-[#30D5C8] rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5 text-black" />
            </div>
            <span className="text-xl font-bold text-white">CoinWayfinder</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center space-x-2 text-gray-300 hover:text-[#30D5C8] transition-colors"
              >
                <item.icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" className="text-gray-300 hover:text-white">
              <User className="w-4 h-4 mr-2" />
              Sign In
            </Button>
            <Button className="bg-[#30D5C8] hover:bg-[#30D5C8]/90 text-black">Get Started</Button>
          </div>

          {/* Mobile menu button */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="sm">
                <Menu className="w-5 h-5 text-white" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-gray-900 border-gray-800">
              <div className="flex flex-col space-y-6 mt-6">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center space-x-3 text-gray-300 hover:text-[#30D5C8] transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="text-lg">{item.name}</span>
                  </Link>
                ))}
                <div className="pt-6 border-t border-gray-800 space-y-4">
                  <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white">
                    <User className="w-4 h-4 mr-2" />
                    Sign In
                  </Button>
                  <Button className="w-full bg-[#30D5C8] hover:bg-[#30D5C8]/90 text-black">Get Started</Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  )
}
