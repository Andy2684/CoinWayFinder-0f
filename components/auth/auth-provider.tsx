'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

// ✅ Расширенный тип User
interface User {
  email: string
  name: string
  avatar?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean }>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const router = useRouter()

  useEffect(() => {
    // Имитация проверки сессии (в будущем — localStorage, cookies, API)
    setTimeout(() => {
      setLoading(false)
    }, 500)
  }, [])

  const login = async (email: string, password: string) => {
    // В реальности — вызов API
    setUser({
      email,
      name: 'Demo User',
      avatar: 'https://i.pravatar.cc/100', // можно заменить на null или динамическое значение
    })
    return { success: true }
  }

  const logout = async () => {
    setUser(null)
    router.push('/auth/login')
  }

  const isAuthenticated = !!user

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
