'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'

// ===== ✅ Исправленный SidebarInput =====

const SidebarInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  return (
    <Input
      ref={ref}
      className={cn(
        'h-8 rounded-md border border-border bg-muted px-3 text-xs shadow-none',
        className
      )}
      {...props}
    />
  )
})
SidebarInput.displayName = 'SidebarInput'

// ===== Заглушки всех компонентов =====

const Sidebar = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>
const SidebarContent = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>
const SidebarFooter = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>
const SidebarGroup = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>
const SidebarGroupAction = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>
const SidebarGroupContent = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>
const SidebarGroupLabel = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>
const SidebarHeader = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>
const SidebarInset = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>
const SidebarMenu = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>
const SidebarMenuAction = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>
const SidebarMenuBadge = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>
const SidebarMenuButton = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>
const SidebarMenuItem = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>
const SidebarMenuSkeleton = () => <div className="bg-muted h-6 rounded-md" />
const SidebarMenuSub = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>
const SidebarMenuSubButton = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>
const SidebarMenuSubItem = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>
const SidebarProvider = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>
const SidebarRail = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>
const SidebarSeparator = () => <hr className="border-border my-2" />
const SidebarTrigger = () => <button>Toggle</button>
const useSidebar = () => ({ isOpen: true, toggle: () => {} })

// ===== Экспорт всех компонентов =====

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
}
