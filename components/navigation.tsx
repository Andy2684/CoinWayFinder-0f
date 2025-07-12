"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Menu,
  Home,
  TrendingUp,
  Bot,
  Settings,
  Bell,
  User,
  LogOut,
  Shield,
  BarChart3,
} from "lucide-react";
import { useAuth } from "./auth/auth-provider";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Signals", href: "/signals", icon: TrendingUp },
  { name: "Trading Bots", href: "/bots", icon: Bot },
  { name: "Integrations", href: "/integrations", icon: Settings },
  { name: "News", href: "/news", icon: BarChart3 },
];

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-gray-900 border-b border-gray-800">
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8"
        aria-label="Global"
      >
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5">
            <span className="text-xl font-bold text-[#30D5C8]">
              CoinWayFinder
            </span>
          </Link>
        </div>

        <div className="flex lg:hidden">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-400"
              >
                <span className="sr-only">Open main menu</span>
                <Menu className="h-6 w-6" aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-gray-900 border-gray-800">
              <div className="mt-6 flow-root">
                <div className="-my-6 divide-y divide-gray-500/10">
                  <div className="space-y-2 py-6">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 hover:bg-gray-800 ${
                          pathname === item.href
                            ? "text-[#30D5C8]"
                            : "text-gray-300"
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <div className="flex items-center">
                          <item.icon className="h-5 w-5 mr-3" />
                          {item.name}
                        </div>
                      </Link>
                    ))}
                    {user?.role === "admin" && (
                      <Link
                        href="/admin"
                        className={`-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 hover:bg-gray-800 ${
                          pathname === "/admin"
                            ? "text-[#30D5C8]"
                            : "text-gray-300"
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <div className="flex items-center">
                          <Shield className="h-5 w-5 mr-3" />
                          Admin
                          <Badge className="ml-2 bg-red-500/10 text-red-400 border-red-500/20">
                            Admin
                          </Badge>
                        </div>
                      </Link>
                    )}
                  </div>
                  <div className="py-6">
                    <Button
                      onClick={handleLogout}
                      variant="ghost"
                      className="w-full justify-start text-gray-300 hover:bg-gray-800"
                    >
                      <LogOut className="h-5 w-5 mr-3" />
                      Sign out
                    </Button>
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
              className={`text-sm font-semibold leading-6 hover:text-[#30D5C8] transition-colors ${
                pathname === item.href ? "text-[#30D5C8]" : "text-gray-300"
              }`}
            >
              <div className="flex items-center">
                <item.icon className="h-4 w-4 mr-2" />
                {item.name}
              </div>
            </Link>
          ))}
          {user?.role === "admin" && (
            <Link
              href="/admin"
              className={`text-sm font-semibold leading-6 hover:text-[#30D5C8] transition-colors ${
                pathname === "/admin" ? "text-[#30D5C8]" : "text-gray-300"
              }`}
            >
              <div className="flex items-center">
                <Shield className="h-4 w-4 mr-2" />
                Admin
                <Badge className="ml-2 bg-red-500/10 text-red-400 border-red-500/20 text-xs">
                  Admin
                </Badge>
              </div>
            </Link>
          )}
        </div>

        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:items-center lg:gap-x-4">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
          >
            <Bell className="h-5 w-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src="/placeholder-user.jpg"
                    alt={user?.name || "User"}
                  />
                  <AvatarFallback className="bg-[#30D5C8] text-[#191A1E]">
                    {user?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-56 bg-gray-900 border-gray-800"
              align="end"
              forceMount
            >
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium text-white">
                    {user?.name || "User"}
                  </p>
                  <p className="w-[200px] truncate text-sm text-gray-400">
                    {user?.email}
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator className="bg-gray-800" />
              <DropdownMenuItem className="text-gray-300 hover:bg-gray-800 hover:text-white">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-gray-300 hover:bg-gray-800 hover:text-white">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-800" />
              <DropdownMenuItem
                className="text-gray-300 hover:bg-gray-800 hover:text-white"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
    </header>
  );
}
