"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Menu, TrendingUp, User, Settings, LogOut } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"

const navigation = [
  { name: "Home", href: "/" },
  { name: "Signals", href: "/signals" },
  { name: "Bots", href: "/bots" },
  { name: "Dashboard", href: "/dashboard" },
  { name: "Integrations", href: "/integrations" },
  { name: "News", href: "/news" },
]

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-[#191A1E]/95 backdrop-blur supports-[backdrop-filter]:bg-[#191A1E]/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-[#30D5C8] rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-[#191A1E]" />
            </div>
            <span className="text-xl font-bold text-white">CoinWayfinder</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-[#30D5C8] ${
                  pathname === item.href ? "text-[#30D5C8]" : "text-gray-300"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* User Menu / Auth Buttons */}
          <div className="flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                      <AvatarFallback className="bg-[#30D5C8] text-[#191A1E]">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-gray-900 border-gray-800" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none text-white">{user.name}</p>
                      <p className="text-xs leading-none text-gray-400">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-gray-800" />
                  <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-gray-800">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-gray-800">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-800" />
                  <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-gray-800" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Button variant="ghost" asChild className="text-gray-300 hover:text-white">
                  <Link href="/auth/login">Sign In</Link>
                </Button>
                <Button asChild className="bg-[#30D5C8] hover:bg-[#30D5C8]/90 text-[#191A1E]">
                  <Link href="/auth/signup">Sign Up</Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] bg-gray-900 border-gray-800">
                <div className="flex flex-col space-y-4 mt-8">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`text-sm font-medium transition-colors hover:text-[#30D5C8] ${
                        pathname === item.href ? "text-[#30D5C8]" : "text-gray-300"
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}

                  {!user && (
                    <div className="flex flex-col space-y-2 pt-4 border-t border-gray-800">
                      <Button variant="ghost" asChild className="text-gray-300 hover:text-white justify-start">
                        <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                          Sign In
                        </Link>
                      </Button>
                      <Button asChild className="bg-[#30D5C8] hover:bg-[#30D5C8]/90 text-[#191A1E] justify-start">
                        <Link href="/auth/signup" onClick={() => setIsOpen(false)}>
                          Sign Up
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
