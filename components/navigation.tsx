"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, LogOut, Settings, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/components/auth/auth-provider"

const navigation = [
  { name: "Home", href: "/" },
  { name: "Signals", href: "/signals" },
  { name: "Bots", href: "/bots" },
  { name: "Portfolio", href: "/portfolio" },
  { name: "News", href: "/news" },
  { name: "Integrations", href: "/integrations" },
]

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const { user, logout, isAuthenticated } = useAuth()

  const handleLogout = async () => {
    await logout()
  }

  return (
    <nav className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b border-border/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <div className="flex flex-shrink-0 items-center">
              <Link href="/" className="text-xl font-bold text-primary">
                CoinWayFinder
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors hover:text-foreground/80 ${
                    pathname === item.href ? "text-foreground border-b-2 border-primary" : "text-foreground/60"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder-user.jpg" alt={user?.firstName} />
                      <AvatarFallback>
                        {user?.firstName?.[0]}
                        {user?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">
                      <BarChart3 className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/auth/login">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link href="/auth/signup">Sign Up</Link>
                </Button>
              </>
            )}
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <Button
              variant="ghost"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center rounded-md p-2"
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="sm:hidden">
          <div className="space-y-1 pb-3 pt-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`block py-2 pl-3 pr-4 text-base font-medium transition-colors ${
                  pathname === item.href ? "text-primary bg-primary/10" : "text-foreground/60 hover:text-foreground/80"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="border-t border-border/40 pt-4 pb-3">
              {isAuthenticated ? (
                <div className="space-y-1">
                  <div className="flex items-center px-4">
                    <div className="flex-shrink-0">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="/placeholder-user.jpg" alt={user?.firstName} />
                        <AvatarFallback>
                          {user?.firstName?.[0]}
                          {user?.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="ml-3">
                      <div className="text-base font-medium text-foreground">
                        {user?.firstName} {user?.lastName}
                      </div>
                      <div className="text-sm font-medium text-muted-foreground">{user?.email}</div>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1">
                    <Link
                      href="/dashboard"
                      className="block px-4 py-2 text-base font-medium text-foreground/60 hover:text-foreground/80"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/dashboard/settings"
                      className="block px-4 py-2 text-base font-medium text-foreground/60 hover:text-foreground/80"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Settings
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout()
                        setMobileMenuOpen(false)
                      }}
                      className="block w-full text-left px-4 py-2 text-base font-medium text-foreground/60 hover:text-foreground/80"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <Link
                    href="/auth/login"
                    className="block px-4 py-2 text-base font-medium text-foreground/60 hover:text-foreground/80"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="block px-4 py-2 text-base font-medium text-foreground/60 hover:text-foreground/80"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
