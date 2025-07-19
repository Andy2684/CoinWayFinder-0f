"use client"

import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Settings, LogOut, BarChart3, Bot, Zap } from "lucide-react"
import { useRouter } from "next/navigation"

export default function Navigation() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/signals", label: "Signals" },
    { href: "/bots", label: "Bots" },
    { href: "/news", label: "News" },
    { href: "/portfolio", label: "Portfolio" },
  ]

  const userNavItems = [
    { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
    { href: "/signals", label: "Signals", icon: Zap },
    { href: "/bots", label: "Bots", icon: Bot },
  ]

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-[#30D5C8] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="font-bold text-xl">Coinwayfinder</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium transition-colors hover:text-[#30D5C8]"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* User Menu / Auth Buttons */}
          <div className="flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {user.firstName?.[0]}
                        {user.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {userNavItems.map((item) => (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link href={item.href} className="flex items-center">
                        <item.icon className="mr-2 h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link href="/auth/login">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link href="/auth/signup">Get Started</Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" className="md:hidden" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col space-y-4 mt-4">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="text-sm font-medium transition-colors hover:text-[#30D5C8]"
                      onClick={() => setIsOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}

                  {!user && (
                    <>
                      <div className="border-t pt-4 space-y-2">
                        <Button variant="ghost" asChild className="w-full justify-start">
                          <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                            Sign In
                          </Link>
                        </Button>
                        <Button asChild className="w-full">
                          <Link href="/auth/signup" onClick={() => setIsOpen(false)}>
                            Get Started
                          </Link>
                        </Button>
                      </div>
                    </>
                  )}

                  {user && (
                    <div className="border-t pt-4 space-y-2">
                      <div className="flex items-center space-x-2 px-2 py-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {user.firstName?.[0]}
                            {user.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>

                      {userNavItems.map((item) => (
                        <Button key={item.href} variant="ghost" asChild className="w-full justify-start">
                          <Link href={item.href} onClick={() => setIsOpen(false)}>
                            <item.icon className="mr-2 h-4 w-4" />
                            {item.label}
                          </Link>
                        </Button>
                      ))}

                      <Button variant="ghost" asChild className="w-full justify-start">
                        <Link href="/dashboard/settings" onClick={() => setIsOpen(false)}>
                          <Settings className="mr-2 h-4 w-4" />
                          Settings
                        </Link>
                      </Button>

                      <Button
                        variant="ghost"
                        onClick={() => {
                          handleLogout()
                          setIsOpen(false)
                        }}
                        className="w-full justify-start"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Log out
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}
