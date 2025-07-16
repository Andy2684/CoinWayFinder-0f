'use client'

import React from 'react'
import { useAuth } from '@/components/auth/auth-provider'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

export default function Navigation() {
  const { user, logout } = useAuth()

  return (
    <div className="flex items-center gap-4 px-4 py-2 border-b">
      <Button variant="ghost" className="relative h-8 w-8 rounded-full">
        <Avatar className="h-8 w-8">
          <AvatarImage src={user?.avatar || '/placeholder.svg'} alt={user?.name || 'User'} />
          <AvatarFallback className="bg-[#30D5C8] text-[#191A1E]">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
      </Button>

      <div className="flex flex-col justify-center">
        <span className="text-sm font-medium text-foreground">{user?.name || 'Гость'}</span>
        <span className="text-xs text-muted-foreground">{user?.email}</span>
      </div>

      <Button variant="outline" size="sm" className="ml-auto" onClick={logout}>
        Выйти
      </Button>
    </div>
  )
}
