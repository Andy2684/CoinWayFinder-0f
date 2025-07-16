'use client'

import { useContext } from 'react'
import { AuthContext } from '@/components/auth/auth-provider'

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  const { user, loading } = context

  return {
    user,
    loading,
    isAuthenticated: !!user, // ✅ добавили это
  }
}
