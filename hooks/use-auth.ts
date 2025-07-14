"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getMe, login as loginApi, logout as logoutApi, register as registerApi } from "@/lib/api"

interface User {
  id: string
  email: string
  name?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getMe()
        setUser(data)
      } catch (error) {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  const login = async (email: string, password: string) => {
    await loginApi(email, password)
    const data = await getMe()
    setUser(data)
    router.push("/")
  }

  const register = async (email: string, password: string) => {
    await registerApi(email, password)
    const data = await getMe()
    setUser(data)
    router.push("/")
  }

  const logout = async () => {
    await logoutApi()
    setUser(null)
    router.push("/auth/login")
  }

  return (
    <React.Fragment>
      <AuthContext.Provider
        value={{
          user,
          loading,
          login,
          register,
          logout,
        }}
      >
        {children}
      </AuthContext.Provider>
    </React.Fragment>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
